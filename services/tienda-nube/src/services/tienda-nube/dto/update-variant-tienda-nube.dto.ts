import { PartialType } from '@nestjs/mapped-types';
import { CreateVariantTiendaNubeDto } from './create-variant-tienda-nube.dto';

export class UpdateVariantTiendaNubeDto extends PartialType(
  CreateVariantTiendaNubeDto,
) {}
