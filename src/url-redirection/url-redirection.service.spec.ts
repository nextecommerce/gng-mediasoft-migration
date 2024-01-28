import { Test, TestingModule } from '@nestjs/testing';
import { UrlRedirectionService } from './url-redirection.service';

describe('UrlRedirectionService', () => {
  let service: UrlRedirectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UrlRedirectionService],
    }).compile();

    service = module.get<UrlRedirectionService>(UrlRedirectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
