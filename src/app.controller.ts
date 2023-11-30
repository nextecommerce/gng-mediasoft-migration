import { Body, Controller, Get, HttpException, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { DataMigrationService } from './DataMigration.service';
import { ProductMigrationService } from './ProductMigration.service';
import { MediasoftMigrationService } from './MediasoftMigration.service';
import { MediaSoftProductDto } from './dto/mediasoft-product.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dataMigrationService: DataMigrationService,
    private readonly productMigrationService: ProductMigrationService,
    private readonly mediasoftMigrationService: MediasoftMigrationService,
  ) { }

  @Post('mediasoft-product')
  async getMediaSoftProduct(@Body() body: MediaSoftProductDto) {
    try {
      return await this.mediasoftMigrationService.getMediaSoftProduct(body);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Post('migrate-with-mediasoft')
  async migrateMediaSoftProduct() {
    try {
      const data = await this.mediasoftMigrationService.migrateMediaSoftProduct();

      return {
        success: true,
        data
      }
    } catch (error) {
      console.log(error)
      throw new HttpException(error.message, error.status);
    }
  }

  @Post('migrate-with-old')
  async migrateWithOldDbProduct() {
    try {
      const data = await this.mediasoftMigrationService.migrateWithOldDbProduct();

      return {
        success: true,
        data
      }
    } catch (error) {
      console.log(error)
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
