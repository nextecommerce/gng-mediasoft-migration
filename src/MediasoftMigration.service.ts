import { Injectable, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { ApiService } from './Api.service';
import { MediaSoftProductDto } from './dto/mediasoft-product.dto';

@Injectable()
export class MediasoftMigrationService {
  constructor(
    @InjectConnection('gng') private readonly gng: Knex,
    @InjectConnection('saas') private readonly saas: Knex,
  ) { }

  // return media soft products
  async getMediaSoftProduct(mediaSoftProductDto?: MediaSoftProductDto) {
    const apiService = new ApiService();
    await apiService.login();
    return await apiService.mediaSoftApi(mediaSoftProductDto);
  }

  // migrate with new database with media soft product
  async migrateMediaSoftProduct() {
    const products = await this.getMediaSoftProduct();
    if (!products?.data) {
      throw new NotFoundException('product not found');
    }

    // await this.saas.transaction(async (trx) => {

    products.data?.map(async (product) => {
      try {
        const [productId] = await this.saas('new_product').insert({
          mediasoft_model_id: product.modelId,
          name: product.modelName,
        });

        product.productDetailResponses?.map(async (subProduct) => {
          const [skuId] = await this.saas('new_sku').insert({
            product_id: productId,
            sku: subProduct.pBarCode,
            custom_sku: subProduct.pBarCode,
            stock_quantity: 1,
            price: subProduct.salePrice,
            discounted_price: subProduct.salePrice,
            cost_price: subProduct.costPrice,
            point_earn: subProduct.pointEarn,
            sbarcode: subProduct.sBarCode,
            vat: subProduct.vatPercent
          });

          const insertedSkuAttribute = await this.saas('new_sku_attribute').insert([{
            sku_id: skuId,
            key: 'Color',
            value: subProduct.colorName,
          }, {
            sku_id: skuId,
            key: 'Memory',
            value: subProduct.memoryCapacity,
          }]);
        })
      } catch (error) {
        console.log(error.message);
      }
    })


    return `${products.data.length} products successfully inserted`;
  }

  private async getAllOldProductInfo(newDbAllSku: string[]) {
    // parent products
    const oldProductsParentIds = await this.gng('portonics_product').distinct().whereIn('sku', newDbAllSku).pluck('parent_id');

    const oldProducts = await this.gng('portonics_product')
      .select(
        'portonics_product.id',
        'slug',
        'sku',
        'brand_id',
        'ws_title',
        'ws_text',
        'name',
        'percent',
        'keywords',
        'meta_description',
        'portonics_product_translation.description',
        'short_description',
        'items_in_the_box',
        'header',
        'footer'
      )
      .leftJoin(
        'portonics_product_translation',
        'portonics_product_translation.product_id',
        '=',
        'portonics_product.id'
      )
      .leftJoin(
        'portonics_product_tax',
        'portonics_product_tax.product_id',
        '=',
        'portonics_product.id'
      )
      .leftJoin(
        'portonics_product_warranty_and_support',
        'portonics_product_warranty_and_support.product_id',
        '=',
        'portonics_product.id'
      )
      .whereIn('portonics_product.id', oldProductsParentIds);

    const allProductsPromise = oldProducts.map(async (product) => {
      const specification = await this.gng('portonics_product_specification')
        .rightJoin(
          'portonics_specification_translation',
          'portonics_specification_translation.specification_id',
          '=',
          'portonics_product_specification.specification_id'
        )
        .where('product_id', product.id);
      const images = await this.gng('portonics_product_images')
        .where('product_id', product.id);

      const imagesStr = images?.map(image => image.name).toString();

      return {
        ...product,
        specification: specification,
        images: images,
        imagesStr: imagesStr || null
      }
    })

    return await Promise.all(allProductsPromise);
  }

  private async getAllOldSkuProductsInfo(newDbAllSku: string[]) {
    // sku products
    const oldSkuProducts = await this.gng('portonics_product')
      .select(
        'portonics_product.id',
        'slug',
        'sku',
        'brand_id',
        'status'
      )
      .whereIn('sku', newDbAllSku);

    const allSkuProductsPromise = oldSkuProducts.map(async (product) => {
      const images = await this.gng('portonics_product_images')
        .where('product_id', product.id);
      const imagesStr = images?.map(image => image.name).toString();

      return {
        ...product,
        images: images,
        imagesStr: imagesStr || null
      }
    });


    return await Promise.all(allSkuProductsPromise);
  }

  // migrate with old db
  async migrateWithOldDbProduct() {
    const newDbAllSku = (await this.saas('new_sku').select('sku')).map(sku => sku.sku);

    // const oldParentProducts = await this.getAllOldProductInfo(newDbAllSku);
    const oldSkuProducts = await this.getAllOldSkuProductsInfo(newDbAllSku);

    // update sku product
    oldSkuProducts.forEach(async (product) => {
      await this.saas('new_sku').update({ images: product.imagesStr }).where('sku', product.sku);
    });

    return "success fully updated";
  }














  async migrateData() {

    const apiService = new ApiService();
    await apiService.login();
    // const response = await apiService.mediaSoftApi();
    // return response
    // await this.gng.transaction(async (trx) => {

    //   // await this.createTable(trx);
    //   // await this.storeStock(trx);
    //   const apiService = new ApiService();
    //   await apiService.login();
    //   const response = await apiService.mediaSoftApi();

    //   // console.log(response)
    //   await this.storeData(response?.data, trx);
    //   // await this.updateModelName(trx);
    //   return response;
    // })
  }

  async createTable(trx: Knex.Transaction) {
    await this.gng.raw(
      'CREATE TABLE `mediasoft_product_variations` ( ' +
      '`id` bigint unsigned NOT NULL AUTO_INCREMENT, ' +
      '`product_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,' +
      '`item_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,' +
      '`s_bar_code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,' +
      '`p_bar_code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,' +
      '`quantity` int DEFAULT NULL,' +
      '`created_at` timestamp NULL DEFAULT NULL,' +
      '`updated_at` timestamp NULL DEFAULT NULL,' +
      '`model_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,' +
      'PRIMARY KEY (`id`))',
    ).transacting(trx);

    await this.gng.raw(
      'CREATE TABLE `mediasoft_products` ( ' +
      '`id` bigint unsigned NOT NULL AUTO_INCREMENT,' +
      '`product_id` int NOT NULL,' +
      '`name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,' +
      '`category_id` int NOT NULL,' +
      '`category_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,' +
      '`model_id` int NOT NULL,' +
      '`model_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,' +
      '`brand_id` int NOT NULL,' +
      '`brand_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,' +
      '`created_at` timestamp NULL DEFAULT NULL,' +
      '`updated_at` timestamp NULL DEFAULT NULL,' +
      'PRIMARY KEY (`id`)) ',
    ).transacting(trx);

    await this.gng.raw(
      'CREATE TABLE `mediasoft_product_stock` ( ' +
      '`id` bigint unsigned NOT NULL AUTO_INCREMENT,' +
      '`item_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,' +
      '`shop_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,' +
      '`pBarCode` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,' +
      '`stock_quantity` int NOT NULL,' +
      '`created_at` timestamp NULL DEFAULT NULL,' +
      '`updated_at` timestamp NULL DEFAULT NULL,' +
      'PRIMARY KEY (`id`)) ',
    ).transacting(trx);
  }

  async storeData(data, trx: Knex.Transaction) {
    data?.forEach(async (element) => {
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
      const productId = await this.gng('mediasoft_products').insert(data);
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
      await this.gng('mediasoft_product_variations').insert(data);;
    });
    return;
  }

  async storeStock(trx: Knex.Transaction) {
    const modelNames =
      await this.gng('mediasoft_products').select('model_name');
    const apiService = new ApiService();
    apiService.login();
    for (let index = 0; index < modelNames.length; index++) {
      if (index % 10 == 0) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      const response = await apiService.mediaSoftStockApi(
        modelNames[index].model_name,
      );
      if (response.data == null) continue;
      response.data.forEach(async (element) => {
        element.stockList.forEach(async (stock) => {
          const data = {
            item_iD: stock.itemID,
            pBarcode: stock.pBarCode,
            shop_id: stock.shopID,
            stock_quantity: stock.balQty,
          };
          await this.gng('mediasoft_product_stock').insert(data).transacting(trx);
        });
      });
    }
  }

  async updateModelName(trx: Knex.Transaction) {
    await this.gng.raw(
      'UPDATE portonics_product' +
      +'JOIN mediasoft_product_variations ON portonics_product.sku = mediasoft_product_variations.p_bar_code' +
      +'SET portonics_product.model_name = mediasoft_product_variations.model_name;',
    ).transacting(trx);
  }
}
