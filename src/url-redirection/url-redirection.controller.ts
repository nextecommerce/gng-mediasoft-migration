import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, Query, Res, ParseArrayPipe } from '@nestjs/common';
import { UrlRedirectionService } from './url-redirection.service';
import { CreateUrlRedirectionDto } from './dto/create-url-redirection.dto';
import { UpdateUrlRedirectionDto } from './dto/update-url-redirection.dto';
import { MongoIdParams, QueryUrlRedirection } from './dto/query-url-redirection.dto';

@Controller('url-redirection')
export class UrlRedirectionController {
  constructor(private readonly urlRedirectionService: UrlRedirectionService) { }
  /**
    * @objective create one url redirection
    * @param createUrlRedirectionDto 
    * @returns 
    */
  @Post()
  async createOne(@Body() createUrlRedirectionDto: CreateUrlRedirectionDto) {
    try {
      const data = await this.urlRedirectionService.createOneUrl(createUrlRedirectionDto);

      return {
        data
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  /**
   * @objective create many url redirection
   * @param createUrlRedirectionDto 
   * @returns 
   */
  @Post('many')
  async createMany(@Body(new ParseArrayPipe({ items: CreateUrlRedirectionDto })) createUrlRedirectionDto: CreateUrlRedirectionDto[]) {
    try {
      const data = await this.urlRedirectionService.createManyUrls(createUrlRedirectionDto);

      return {
        data
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

}
