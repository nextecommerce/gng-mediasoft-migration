import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUrlRedirectionDto } from './dto/create-url-redirection.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId } from 'mongoose';
import { UrlRedirection } from './schema/url-redirection.schema';

@Injectable()
export class UrlRedirectionService {

  constructor(
    @InjectModel(UrlRedirection.name) private urlRedirectionModel: Model<UrlRedirection>,
  ) {
  }

  // create many urls redirection
  async createManyUrls(createUrlRedirectionDto: CreateUrlRedirectionDto[]) {
    // store into database
    const newUrls = await this.urlRedirectionModel.insertMany(createUrlRedirectionDto);

    return newUrls;
  }

  // create one urls redirection
  async createOneUrl(createUrlRedirectionDto: CreateUrlRedirectionDto) {
    // store into database
    const newUrl = new this.urlRedirectionModel(createUrlRedirectionDto);

    return await newUrl.save();
  }

}
