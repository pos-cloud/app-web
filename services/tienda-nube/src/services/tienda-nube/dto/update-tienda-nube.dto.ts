import { PartialType } from '@nestjs/mapped-types';
import { CreateTiendaNubeDto } from './create-tienda-nube.dto';

export class UpdateTiendaNubeDto extends PartialType(CreateTiendaNubeDto) {}
