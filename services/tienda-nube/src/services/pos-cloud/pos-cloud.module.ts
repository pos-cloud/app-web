import { Module } from '@nestjs/common';
import { PosCloudService } from './services/pos-cloud.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [PosCloudService],
  exports: [PosCloudService],
})
export class PostCloudModule {}
