import { PartialType } from '@nestjs/mapped-types';
import { CreateProductTiendaNubeDTO } from './create-product-tienda-nube.dto';

export class UpdateProductTiendaNubeDto extends PartialType(
  CreateProductTiendaNubeDTO,
) {}
