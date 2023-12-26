import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KnexModule } from 'nest-knexjs';
import knexConfig from '../knexconfig';
import gngConfig from '../gngconfig';
import { MigrationService } from './migration.service';
import { Cron, ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    KnexModule.forRoot(knexConfig, 'saas'),
    KnexModule.forRoot(gngConfig, 'gng'),
    ScheduleModule.forRoot()
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MigrationService,
  ],
})
export class AppModule {
  @Cron('3 * * * * *')
  handleCron() {
    console.log('cron run');
  }
}
