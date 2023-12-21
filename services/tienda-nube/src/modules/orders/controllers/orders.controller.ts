import { Controller, Get, HttpCode, Post, Request } from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import CustomRequest from 'src/common/interfaces/request.interface';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('post-webhook')
  @HttpCode(200)
  postWebhook(@Request() request: CustomRequest) {
    return this.ordersService.wehbook(request.body);
  }
}
