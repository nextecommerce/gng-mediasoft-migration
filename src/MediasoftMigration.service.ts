import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { ApiService } from './Api.service';

@Injectable()
export class MediasoftMigrationService {
  constructor(
    @InjectConnection('gng') private readonly gng: Knex,
    @InjectConnection('saas') private readonly saas: Knex,
  ) {}

  async migrateData() {
    await this.storeStock();
    const apiService = new ApiService();
    await apiService.login();
    const response = await apiService.mediaSoftApi();
    await this.createTable();
    await this.storeData(response.data);
    await this.updateModelName();
  }

  async createTable() {
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
    );

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
    );

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
    );
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
      await this.gng('mediasoft_product_variations').insert(data);
    });
    return;
  }

  async storeStock() {
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
          await this.gng('mediasoft_product_stock').insert(data);
        });
      });
    }
  }

  async updateModelName() {
    await this.gng.raw(
      'UPDATE portonics_product' +
        +'JOIN mediasoft_product_variations ON portonics_product.sku = mediasoft_product_variations.p_bar_code' +
        +'SET portonics_product.model_name = mediasoft_product_variations.model_name;',
    );
  }
}
