import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectModel } from 'nest-knexjs';
import { ApiService } from './Api.service';

@Injectable()
export class MediasoftMigrationService {
  constructor(@InjectModel() private readonly knex: Knex) {}

  async productData() {
    const apiService = new ApiService();
    const response = await apiService.mediaSoftApi();
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
}
