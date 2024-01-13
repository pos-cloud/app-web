import { Test, TestingModule } from '@nestjs/testing';
import { PosCloudService } from './pos-cloud.service';

describe('PosCloudService', () => {
  let service: PosCloudService;

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
