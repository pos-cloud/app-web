import { Test, TestingModule } from '@nestjs/testing';
import { PostCloudService } from './post-cloud.service';

describe('PostCloudService', () => {
  let service: PostCloudService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostCloudService],
    }).compile();

    service = module.get<PostCloudService>(PostCloudService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
