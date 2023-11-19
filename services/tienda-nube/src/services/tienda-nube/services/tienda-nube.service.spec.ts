import { Test, TestingModule } from '@nestjs/testing';
import { TiendaNubeService } from './tienda-nube.service';

describe('TiendaNubeService', () => {
  let service: TiendaNubeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TiendaNubeService],
    }).compile();

    service = module.get<TiendaNubeService>(TiendaNubeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
