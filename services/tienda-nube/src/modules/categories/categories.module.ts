import { Module } from '@nestjs/common';
import { CategoriesService } from './services/categories.service';
import { CategoriesController } from './controllers/categories.controller';
import { DatabaseModule } from 'src/database/database.module';
import { TiendaNubeModule } from 'src/services/tienda-nube/tienda-nube.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [DatabaseModule, TiendaNubeModule, HttpModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService]
})
export class CategoriesModule {}
