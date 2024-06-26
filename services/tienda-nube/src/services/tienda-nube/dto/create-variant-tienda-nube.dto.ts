import { IsNumber, IsOptional, IsString, IsObject} from 'class-validator';

export class CreateVariantTiendaNubeDto {
  @IsNumber()
  price: number;

  @IsNumber()
  stock: number;

  @IsOptional()
  @IsString()
  sku: string;

  @IsOptional()
  @IsString()
  width: string;

  @IsString()
  @IsOptional()
  height: string;

  @IsString()
  @IsOptional()
  weight: string;

  @IsOptional()
  @IsString()
  depth: string;

  @IsOptional()
  stock_management: boolean

  @IsObject()
  @IsOptional()
  attributes: Object | any;
}
