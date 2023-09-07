import { Controller, Get } from '@nestjs/common';
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
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('migrate-data')
  migrateData() {
    // return this.dataMigrationService.migrate();
    return this.mediasoftMigrationService.migrateData();
  }

  @Get('product-data')
  async productData() {
    // return this.appService.migrateSpecification();
  }

  @Get('update-data')
  async updateData() {
    // return this.appService.updateModelName();
  }
}
