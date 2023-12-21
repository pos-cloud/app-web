import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import CustomRequest from 'src/common/interfaces/request.interface';
import { CancelOrderDto } from '../dtos/cancel-order.dto';
import { FulFillOrderDto } from '../dtos/fulfill-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('post-webhook')
  @HttpCode(200)
  postWebhook(@Request() request: CustomRequest) {
    return this.ordersService.wehbook(request.body);
  }

  @Post(':orderId/open')
  openOrder(
    @Param('orderId') orderId: string,
    @Body('storeId') storeId: number,
  ) {
    return this.ordersService.openOrder(orderId, storeId);
  }

  @Post(':orderId/close')
  closeOrder(
    @Param('orderId') orderId: string,
    @Body('storeId') storeId: number,
  ) {
    return this.ordersService.closeOrder(orderId, storeId);
  }
  @Post(':orderId/cancel')
  cancelOrder(
    @Param('orderId') orderId: string,
    @Body() cancelOrderDto: CancelOrderDto,
  ) {
    return this.ordersService.cancelOrder(orderId, cancelOrderDto);
  }
  @Post(':orderId/pack')
  packOrder(
    @Param('orderId') orderId: string,
    @Body('storeId') storeId: number,
  ) {
    return this.ordersService.packOrder(orderId, storeId);
  }
  @Post(':orderId/fulfill')
  fulfillOrder(
    @Param('orderId') orderId: string,
    @Body() fulfillOrderDto: FulFillOrderDto,
  ) {
    return this.ordersService.fulfillOrder(orderId, fulfillOrderDto);
  }
}
