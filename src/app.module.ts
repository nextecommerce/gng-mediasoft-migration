import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KnexModule } from 'nest-knexjs';
import knexConfig from '../knexconfig';

@Module({
  imports: [KnexModule.forRoot(knexConfig)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
