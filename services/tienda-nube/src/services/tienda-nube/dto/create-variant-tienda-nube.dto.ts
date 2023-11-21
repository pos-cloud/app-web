import { IsNumber } from 'class-validator';

export class CreateVariantTiendaNubeDto {
  @IsNumber()
  price: number;

  @IsNumber()
  stock: number;
}
