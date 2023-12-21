import { Module } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './controllers/orders.controller';
import { TiendaNubeModule } from 'src/services/tienda-nube/tienda-nube.module';
import { PostCloudModule } from 'src/services/post-cloud/post-cloud.module';

@Module({
  imports: [TiendaNubeModule, PostCloudModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
