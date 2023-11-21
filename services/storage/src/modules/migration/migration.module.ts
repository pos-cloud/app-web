import { Module } from '@nestjs/common';
import { MigrationService } from './services/migration.service';
import { MigrationController } from './controllers/migration.controller';
import { DatabaseModule } from 'src/database/database.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [DatabaseModule, UploadModule],
  controllers: [MigrationController],
  providers: [MigrationService],
})
export class MigrationModule {}
