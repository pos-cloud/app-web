import { IsNumber, IsString } from 'class-validator';

export class CreateVariantTiendaNubeDto {
  @IsNumber()
  price: number;

  @IsNumber()
  stock: number;

  @IsString()
  sku: string;

  @IsString()
  width: string

  @IsString()
  height : string

  @IsString()
  weight : string

  @IsString()
  depth : string
}
