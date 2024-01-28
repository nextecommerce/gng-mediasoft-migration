import { Body, Controller, Get, HttpException, Post, Query } from '@nestjs/common';
import { MigrationService } from './migration.service';
import { MediaSoftProductDto, MediaSoftProductStockDto } from './dto/mediasoft-product.dto';

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

  @Post('mediasoft-product-stock')
  async getMediaSoftProductStock(@Body() body: MediaSoftProductStockDto) {
    try {
      return await this.migrationService.getMediaSoftProductStock(body);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Get('product-imei')
  async getProductIMEIInfoByModelNo(@Query('modelNo') modelNo: number) {
    try {
      return await this.migrationService.getProductIMEIInfoByModelNo(modelNo);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Post('migrate-with-mediasoft-gadget')
  async migrateMediaSoftGadgetProduct(@Body() mediaSoftProductDto: MediaSoftProductDto) {
    try {
      const data = await this.migrationService.migrateMediaSoftGadgetModelProduct(mediaSoftProductDto);

      return {
        success: true,
        data
      }
    } catch (error) {
      console.log(error)
      throw new HttpException(error.message, error.status);
    }
  }


  @Post('migrate-with-mediasoft')
  async migrateMediaSoftProduct(@Body() mediaSoftProductDto: MediaSoftProductDto) {
    try {
      const data = await this.migrationService.migrateMediaSoftProduct(mediaSoftProductDto);

      return {
        success: true,
        data
      }
    } catch (error) {
      console.log(error)
      throw new HttpException(error.message, error.status);
    }
  }

  @Post('migrate-with-mediasoft-stock')
  async migrateStockQuantity(@Body() mediaSoftProductStockDto: MediaSoftProductStockDto) {
    try {
      const data = await this.migrationService.migrateStockQuantity(mediaSoftProductStockDto);

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

  @Post('migrate-with-old-category-brand-attribute')
  async migrateBrandCategoryAttribute() {
    try {
      const data = await this.migrationService.migrateBrandCategoryAttribute();

      return {
        success: true,
        data
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Post('migrate-customers')
  async migrateCustomers() {
    try {
      const data = await this.migrationService.migrateCustomers();

      return {
        success: true,
        data
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Post('migrate-orders')
  async migrateOrders() {
    try {
      const data = await this.migrationService.migrateOrders();

      return {
        success: true,
        data
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Post('migrate-order-attributes')
  async migrateOrderAttributes() {
    try {
      const data = await this.migrationService.migrateOrderProductAttributes();

      return {
        success: true,
        data
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Post('migrate-order-logs')
  async migrateOrderLogs() {
    try {
      const data = await this.migrationService.migrateOrderLog();

      return {
        success: true,
        data
      }
    } catch (error) {
      console.log(error);
      // throw new HttpException(error.message, error.status);
    }
  }

  @Post('migrate-order-notes')
  async migrateOrderNotes() {
    try {
      const data = await this.migrationService.migrateOrderNote();

      return {
        success: true,
        data
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Post('migrate-order-address-log')
  async migrateOrderAddressLog() {
    try {
      const data = await this.migrationService.migrateOrderAddressLog();

      return {
        success: true,
        data
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Post('migrate-order-transaction')
  async migrateOrderTransaction() {
    try {
      const data = await this.migrationService.migrateOrderTransaction();

      return {
        success: true,
        data
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Post('migrate-url-redirection')
  async migrateUrlRedirection() {
    try {
      const data = await this.migrationService.migrateUrlRedirection();

      return {
        success: true,
        data
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Get('replace-url-from-description')
  async replaceStrFromLongText() {
    try {
      const data = await this.migrationService.replaceStrFromLongText();

      return {
        success: true,
        data
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Get('filter-sku')
  async filterSkuWithOldSkuProduct() {
    try {
      const data = await this.migrationService.filterSkuWithOldSkuProduct();

      return {
        success: true,
        data
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Get('update-color-sku-attribute')
  async convertToJson() {
    try {
      const data = await this.migrationService.convertToJson();

      return {
        success: true,
        data
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Get('fix-product-title')
  async changeQuoteFromProduct() {
    try {
      const data = await this.migrationService.changeQuoteFromProduct();

      return {
        success: true,
        data
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Get('db-test')
  async testDB() {
    try {
      const data = await this.migrationService.testDB();

      return {
        success: true,
        data
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

}
