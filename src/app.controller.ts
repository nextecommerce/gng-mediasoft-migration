import { Controller, Get, HttpException } from '@nestjs/common';
import { AppService } from './app.service';
import { DataMigrationService } from './DataMigration.service';
import { ProductMigrationService } from './ProductMigration.service';
import { MediasoftMigrationService } from './MediasoftMigration.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dataMigrationService: DataMigrationService,
    private readonly productMigrationService: ProductMigrationService,
    private readonly mediasoftMigrationService: MediasoftMigrationService,
  ) { }

  @Get()
  async getHello() {
    try {
      return this.appService.getHello();
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, error.status);
    }
  }

  @Get('migrate-data')
  async migrateData() {
    try {
      await this.dataMigrationService.migrate();

      return {
        success: true,
        message: "successfully migrated"
      }
    } catch (error) {
      console.log(error)
      throw new HttpException(error.message, error.status);
    }
  }

  @Get('product-data')
  async productData() {
    try {
      return await this.mediasoftMigrationService.migrateData();
      await this.productMigrationService.migrateData();
    } catch (error) {
      console.log(error)
      throw new HttpException(error.message, error.status);
    }
  }

  @Get('update-data')
  async updateData() {
    // return this.productMigrationService.updateModelName();
  }
}
