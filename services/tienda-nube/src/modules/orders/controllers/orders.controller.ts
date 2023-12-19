import { Controller, Get, HttpCode, Post, Request } from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import CustomRequest from 'src/common/interfaces/request.interface';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Request() request: CustomRequest) {}
  @Get('get-webhook')
  @HttpCode(200)
  getWebhook(@Request() request: CustomRequest) {
    console.log(request);
  }

  @Post('post-webhook')
  @HttpCode(200) 
  postWebhook(@Request() request: CustomRequest) {
    console.log(request);
  }
}