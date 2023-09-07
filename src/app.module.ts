import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KnexModule } from 'nest-knexjs';
import knexConfig from '../knexconfig';
import gngConfig from '../gngconfig';

@Module({
  imports: [KnexModule.forRoot(knexConfig), KnexModule.forRoot(gngConfig)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
