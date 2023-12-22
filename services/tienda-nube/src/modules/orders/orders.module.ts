import { Module } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './controllers/orders.controller';
import { TiendaNubeModule } from 'src/services/tienda-nube/tienda-nube.module';
import { PosCloudModule } from 'src/services/pos-cloud/pos-cloud.module';

@Module({
  imports: [TiendaNubeModule, PosCloudModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
