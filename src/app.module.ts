import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KnexModule } from 'nest-knexjs';
import knexConfig from '../knexconfig';
import gngConfig from '../gngconfig';
import { DataMigrationService } from './DataMigration.service';
import { ProductMigrationService } from './ProductMigration.service';

@Module({
  imports: [
    KnexModule.forRoot(knexConfig, 'saas'),
    KnexModule.forRoot(gngConfig, 'gng'),
  ],
  controllers: [AppController],
  providers: [AppService, DataMigrationService, ProductMigrationService],
})
export class AppModule {}
