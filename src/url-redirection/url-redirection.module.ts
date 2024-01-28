import { Module } from '@nestjs/common';
import { UrlRedirectionService } from './url-redirection.service';
import { UrlRedirectionController } from './url-redirection.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UrlRedirection, urlRedirectionSchema } from './schema/url-redirection.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UrlRedirection.name, schema: urlRedirectionSchema }])
  ],
  controllers: [UrlRedirectionController],
  providers: [UrlRedirectionService],
  exports: [UrlRedirectionService]
})
export class UrlRedirectionModule { }
