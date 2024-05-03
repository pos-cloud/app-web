import { Module } from '@nestjs/common';
import { DatabaseService } from './services/database.service';
import { PoolDatabase } from './services/database-2.service';

@Module({
  providers: [DatabaseService, PoolDatabase],
  exports: [DatabaseService, PoolDatabase],
})
export class DatabaseModule {}
