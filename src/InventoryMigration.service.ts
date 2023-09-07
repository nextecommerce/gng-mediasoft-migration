import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectModel } from 'nest-knexjs';
import { ApiService } from './Api.service';

@Injectable()
export class InventoryMigrationService {
  constructor(@InjectModel() private readonly knex: Knex) {}

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
    const apiService = new ApiService();
    const stockInfo = await apiService.mediaSoftStockApi(modelName);
    let balQty = 0;
    stockInfo.data.forEach(async (element) => {
      balQty += element.balQty;
    });
    console.log('qty ', stockInfo);
    return balQty;
  }

  async updateDailyData() {}
}
