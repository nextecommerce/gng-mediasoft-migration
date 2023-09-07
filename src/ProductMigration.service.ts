import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';

@Injectable()
export class ProductMigrationService {
  constructor(
    @InjectConnection('gng') private readonly gng: Knex,
    @InjectConnection('saas') private readonly saas: Knex,
  ) {}

  async migrateData() {
    const portonicsProduct = await this.gng('portonics_product_translation')
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
    await this.migrateSku();
    await this.migrateSkuAttribute();
    return await this.migrateSpecification();
  }

  async migrateBasicData(data) {
    for (let index = 0; index < data.length; index++) {
      await this.saas('product').insert({
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
    const response = await this.gng('portonics_product');
    for (let index = 0; index < response.length; index++) {
      await this.saas('sku').insert({
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
    return;
  }

  async migrateSkuAttribute() {
    const products = await this.gng('portonics_product');
    const attributeList = await this.gng('portonics_attribute_translation');
    for (let index = 0; index < products.length; index++) {
      const element = products[index].combination_data;
      if (element != null && element.length > 0) {
        const jsonData = JSON.parse(element);
        for (let jsonIndex = 0; jsonIndex < jsonData.length; jsonIndex++) {
          await this.saas('sku_attribute').insert({
            sku_id: products[index].id,
            key: attributeList.find(
              (ele) => ele.attr_id == jsonData[jsonIndex].attr_id,
            ).name,
            value: jsonData[jsonIndex].value_name,
          });
        }
      }
    }
    return;
  }

  async migrateSpecification() {
    const response = await this.gng('portonics_product_specification').join(
      'portonics_specification_translation',
      'portonics_product_specification.specification_id',
      '=',
      'portonics_specification_translation.specification_id',
    );
    for (let index = 0; index < response.length; index++) {
      await this.saas('specification').insert({
        id: response[index].id,
        product_id: response[index].product_id,
        key: response[index].title,
        value: response[index].description,
      });
    }
    return;
  }
}
