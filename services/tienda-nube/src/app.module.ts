import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';

import { CategoriesModule } from './modules/categories/categories.module';
import { DatabaseModule } from './database/database.module';
import { AuthMiddleware } from './auth/middleware/auth.middleware';
import { TiendaNubeModule } from './services/tienda-nube/tienda-nube.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PostCloudModule } from './services/post-cloud/pos-cloud.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    CategoriesModule,
    TiendaNubeModule,
    ProductsModule,
    OrdersModule,
    PostCloudModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'orders', method: RequestMethod.GET },
        { path: 'orders', method: RequestMethod.POST },
        'orders/(.*)',
      )
      .forRoutes('*');
  }
}
