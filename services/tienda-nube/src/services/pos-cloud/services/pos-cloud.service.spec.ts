import { Test, TestingModule } from '@nestjs/testing';
import { PosCloudService } from './post-cloud.service';

describe('PosCloudService', () => {
  let service: PostCloudService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PosCloudService],
    }).compile();

    service = module.get<PosCloudService>(PosCloudService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
