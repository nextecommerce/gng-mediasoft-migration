import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KnexModule } from 'nest-knexjs';
import knexConfig from '../knexconfig';
import gngConfig from '../gngconfig';
import { MigrationService } from './migration.service';

@Module({
  imports: [
    KnexModule.forRoot(knexConfig, 'saas'),
    KnexModule.forRoot(gngConfig, 'gng'),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MigrationService,
  ],
})
export class AppModule { }
