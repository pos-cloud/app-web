import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Put,
} from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { TiendaNubeService } from '../../../services/tienda-nube/services/tienda-nube.service';
import CustomRequest from 'src/common/interfaces/request.interface';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly tiendaNubeService: TiendaNubeService,
  ) {}

  @Post()
  create(
    @Body('productId') ProductId: string,
    @Request() request: CustomRequest,
  ) {
    try {
      return this.productsService.create(request.database, ProductId);
    } catch (err) {
      console.log(err);
    }
  }

  @Get()
  findAll(@Request() request: CustomRequest, @Body('page') page: string) {
    return this.productsService.findAll(request.database, page);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.productsService.findOne(+id);
  // }

  @Patch(':productId')
  update(
    @Param('productId') productId: string,
    @Request() request: CustomRequest,
  ) {
    return this.productsService.update(request.database, productId);
  }

  @Put('massive')
  massiveUpdate(
    @Body('tiendaNubeIds') tiendaNubeIds: string[],
    @Request() request: CustomRequest,
  ) {
    return this.productsService.massiveUpdate(request.database, tiendaNubeIds);
  }

  @Delete('variant')
  removeVariants(
    @Body('productTn') productTn: string,
    @Body('variantTn') variantTn: string,
    @Request() request: CustomRequest,
  ) {
    return this.productsService.removeVariant(
      request.database,
      productTn,
      variantTn,
    );
  }

  @Delete(':tiendaNubeId')
  remove(
    @Param('tiendaNubeId') tiendaNubeId: string,
    @Request() request: CustomRequest,
  ) {
    return this.productsService.remove(request.database, tiendaNubeId);
  }
}
