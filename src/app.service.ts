import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Knex } from 'knex';
import { InjectConnection, InjectModel } from 'nest-knexjs';
import { distinct } from 'rxjs';

@Injectable()
export class AppService {
  constructor(@InjectModel() private readonly knex: Knex) {}

  key =
    'kVU41twDyttUL/SM7IO0vQ==@kVU41twDyttUL/SM7IO0vQ==G2mggVTBb29HisH8sVRVcMdwhLIQ3SeXMIIVBRMqiow=';

  getHello(): string {
    return 'Hello World!';
  }

  async productData() {
    const response = await this.mediaSoftApi();
    return await this.storeData(response.data);
  }

  async storeData(data) {
    data.forEach(async (element) => {
      const data = {
        product_id: element.productId,
        name: element.productName,
        category_name: element.categoryName,
        category_id: element.categoryId,
        model_id: element.modelId,
        model_name: element.modelName,
        brand_id: element.brandId,
        brand_name: element.brandName,
      };
      const productId = await this.knex('mediasoft_products').insert(data);
      await this.storeDetail(element.productDetailResponses, productId[0]);
    });
    return;
  }

  async storeDetail(detail, productId) {
    detail.forEach(async (element) => {
      const data = {
        product_id: productId,
        item_id: element.itemId,
        model_name: element.modelName,
        s_bar_code: element.sBarCode,
        p_bar_code: element.pBarCode,
        quantity: element.modelName,
      };
      await this.knex('mediasoft_product_variations').insert(data);
    });
    return;
  }

  async updateModelName() {
    await this.knex.raw(
      'UPDATE portonics_product ' +
        'JOIN mediasoft_product_variations ON portonics_product.sku = mediasoft_product_variations.p_bar_code ' +
        'SET portonics_product.model_name = mediasoft_product_variations.p_bar_code',
    );
  }

  async stockData() {
    const models = await this.knex('mediasoft_products')
      .pluck('model_name')
      .distinct();
    for (let index = 0; index < models.length; index++) {
      const element = models[index];
      const stockQty = await this.getStock(element);
      console.log(stockQty);
      // await this.knex('mediasoft_product_variations')
      //   .where('model_name', element)
      //   .update({ quantity: stockQty });
    }
  }

  async getStock(modelName) {
    console.log('model name ', modelName);
    const stockInfo = await this.mediaSoftStockApi(modelName);
    let balQty = 0;
    stockInfo.data.forEach(async (element) => {
      balQty += element.balQty;
    });
    console.log('qty ', stockInfo);
    return balQty;
  }

  async mediaSoftApi(modelName = '', createDate = '') {
    const config = {
      headers: {
        Access_token: this.key,
        Accept: 'application/json',
      },
    };
    const response = await axios.post(
      'http://203.76.110.162:8081/Product/GetProductData',
      {
        categoryName: '',
        productName: '',
        modelName: modelName,
        brandName: '',
        createDate: createDate,
      },
      config,
    );
    return response.data;
  }

  async mediaSoftStockApi(modelName) {
    const config = {
      headers: {
        Access_token: this.key,
        Accept: 'application/json',
      },
    };
    const response = await axios.post(
      'http://203.76.110.162:8081/Product/GetProductStockInfo',
      {
        barcode: 'ALL',
        modelName: modelName,
        shopID: 'ALL',
      },
      config,
    );
    console.log(response.data);
    return response.data;
  }

  async migrateData() {
    // get portonics product
    console.log('from migration data');
    const portonicsProduct = await this.knex('portonics_product_translation')
      .join(
        'portonics_product',
        'portonics_product_translation.product_id',
        '=',
        'portonics_product.id',
      )
      .join(
        'portonics_product_options',
        'portonics_product_translation.product_id',
        '=',
        'portonics_product_options.product_id',
      )
      .join(
        'portonics_product_warranty_and_support',
        'portonics_product_translation.product_id',
        '=',
        'portonics_product_warranty_and_support.product_id',
      )
      .orderBy('portonics_product_translation.product_id')
      .distinct('portonics_product.parent_id')
      .select(
        'portonics_product.*',
        'portonics_product_translation.*',
        'portonics_product_warranty_and_support.*',
        'portonics_product_options.*',
      );
    await this.migrateBasicData(portonicsProduct);
    // migrate sku
  }

  async migrateBasicData(data) {
    for (let index = 0; index < data.length; index++) {
      await this.knex('product').insert({
        id: data[index].product_id,
        name: data[index].name,
        slug: data[index].slug,
        sku: data[index].sku,
        category_id: data[index].cat_id,
        brand_id: data[index].brand_id,
        short_description: data[index].short_description,
        long_description: data[index].description,
        warranty: data[index].ws_title,
        warranty_policy: data[index].ws_text,
        package_weight: data[index].weight,
        package_length: data[index].length,
        package_width: data[index].width,
        package_height: data[index].height,
      });
    }
    return;
  }

  async migrateSku() {
    const response = await this.knex('portonics_product');
    for (let index = 0; index < response.length; index++) {
      await this.knex('sku').insert({
        id: response[index].id,
        product_id: response[index].parent_id,
        sku: response[index].sku,
        custom_sku: response[index].custom_sku,
        price: response[index].regular_price,
        discounted_price: response[index].sell_price,
        stock_quantity: response[index].quantity,
        status: response[index].status,
      });
    }
  }

  async migrateSkuAttribute() {
    const products = await this.knex('portonics_product');
    const attributeList = await this.knex('portonics_attribute_translation');
    for (let index = 0; index < products.length; index++) {
      const element = products[index].combination_data;
      if (element != null && element.length > 0) {
        const jsonData = JSON.parse(element);
        for (let jsonIndex = 0; jsonIndex < jsonData.length; jsonIndex++) {
          await this.knex('sku_attribute').insert({
            sku_id: products[index].id,
            key: attributeList.find(
              (ele) => ele.attr_id == jsonData[jsonIndex].attr_id,
            ).name,
            value: jsonData[jsonIndex].value_name,
          });
        }
      }
    }
  }

  async migrateSpecification() {
    const response = await this.knex('portonics_product_specification').join(
      'portonics_specification_translation',
      'portonics_product_specification.specification_id',
      '=',
      'portonics_specification_translation.specification_id',
    );
    for (let index = 0; index < response.length; index++) {
      await this.knex('specification').insert({
        id: response[index].id,
        product_id: response[index].product_id,
        key: response[index].title,
        value: response[index].description,
      });
    }
  }
}
