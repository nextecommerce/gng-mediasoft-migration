import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KnexModule } from 'nest-knexjs';
import knexConfig from '../knexconfig';
import gngConfig from '../gngconfig';
import { MigrationService } from './migration.service';
import { Cron, ScheduleModule } from '@nestjs/schedule';
import { CronModule } from './cron.module';
import { ApiService } from './Api.service';
import { UrlRedirectionModule } from './url-redirection/url-redirection.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    KnexModule.forRoot(knexConfig, 'saas'),
    KnexModule.forRoot(gngConfig, 'gng'),
    MongooseModule.forRoot(process.env.MONGODB_URL),
    ScheduleModule.forRoot(),
    CronModule,
    UrlRedirectionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MigrationService,
    ApiService
  ],
})
export class AppModule { }
