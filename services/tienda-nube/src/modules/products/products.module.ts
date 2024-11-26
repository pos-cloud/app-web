import { Module } from '@nestjs/common';
import { PictureService } from 'src/common/services/picture.service';
import { DatabaseModule } from 'src/database/database.module';
import { TiendaNubeModule } from 'src/services/tienda-nube/tienda-nube.module';
import { CategoriesModule } from '../categories/categories.module';
import { ProductsController } from './controllers/products.controller';
import { ProductsService } from './services/products.service';
import { VariantProduct } from './services/variant.service';

@Module({
  imports: [DatabaseModule, TiendaNubeModule, CategoriesModule],
  controllers: [ProductsController],
  providers: [ProductsService, VariantProduct, PictureService],
})
export class ProductsModule {}
