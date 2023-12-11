import { Controller, Get, Post, Request } from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import CustomRequest from 'src/common/interfaces/request.interface';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Request() request: CustomRequest) {}
  @Get('get-webhook')
  getWebhook(@Request() request: CustomRequest) {
    console.log(request.body);
  }

  @Post('post-webhook')
  postWebhook(@Request() request: CustomRequest) {
    console.log(request.body);
  }
}
