import { Module } from '@nestjs/common';
import { UploadService } from './services/upload.service';
import { UploadController } from './controllers/upload.controller';
import { S3Module } from 'src/services/s3/s3.module';

@Module({
  imports:[S3Module],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
