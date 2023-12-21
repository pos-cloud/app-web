import { Module } from '@nestjs/common';
import { PostCloudService } from './services/post-cloud.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [PostCloudService],
  exports: [PostCloudService],
})
export class PostCloudModule {}
