import { Body, Controller, Get, HttpException, Post } from '@nestjs/common';
import { MigrationService } from './migration.service';
import { MediaSoftProductDto } from './dto/mediasoft-product.dto';

@Controller()
export class AppController {
  constructor(
    private readonly migrationService: MigrationService,
  ) { }

  @Post('mediasoft-product')
  async getMediaSoftProduct(@Body() body: MediaSoftProductDto) {
    try {
      return await this.migrationService.getMediaSoftProduct(body);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Post('migrate-with-mediasoft')
  async migrateMediaSoftProduct() {
    try {
      const data = await this.migrationService.migrateMediaSoftProduct();

      return {
        success: true,
        data
      }
    } catch (error) {
      console.log(error)
      throw new HttpException(error.message, error.status);
    }
  }

  @Post('migrate-with-old-sku')
  async migrateWithOldDbSku() {
    try {
      const data = await this.migrationService.migrateWithOldDbSku();

      return {
        success: true,
        data
      }
    } catch (error) {
      console.log(error)
      throw new HttpException(error.message, error.status);
    }
  }

  @Post('migrate-with-old-product')
  async migrateWithOldDbProduct() {
    try {
      const data = await this.migrationService.migrateWithOldDbProduct();

      return {
        success: true,
        data
      }
    } catch (error) {
      console.log(error)
      throw new HttpException(error.message, error.status);
    }
  }

}
