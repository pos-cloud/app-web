import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

import { CategoriesModule } from './modules/categories/categories.module';
import { DatabaseModule } from './database/database.module';
import { AuthMiddleware } from './auth/middleware/auth.middleware';
import { TiendaNubeModule } from './services/tienda-nube/tienda-nube.module';
import { ProductsModule } from './modules/products/products.module';

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule, CategoriesModule, TiendaNubeModule, ProductsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
