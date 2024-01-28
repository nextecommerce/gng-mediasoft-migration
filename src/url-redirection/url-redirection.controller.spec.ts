import { Test, TestingModule } from '@nestjs/testing';
import { UrlRedirectionController } from './url-redirection.controller';
import { UrlRedirectionService } from './url-redirection.service';

describe('UrlRedirectionController', () => {
  let controller: UrlRedirectionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlRedirectionController],
      providers: [UrlRedirectionService],
    }).compile();

    controller = module.get<UrlRedirectionController>(UrlRedirectionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
