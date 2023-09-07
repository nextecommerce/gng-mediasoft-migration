import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KnexModule } from 'nest-knexjs';
import knexConfig from '../knexconfig';
import gngConfig from '../gngconfig';
import { DataMigrationService } from './DataMigration.service';

@Module({
  imports: [
    KnexModule.forRoot(knexConfig, 'gng'),
    KnexModule.forRoot(gngConfig, 'saas'),
  ],
  controllers: [AppController],
  providers: [AppService, DataMigrationService],
})
export class AppModule {}
