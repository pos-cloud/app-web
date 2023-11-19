import { IsObject, IsOptional, IsNumber } from 'class-validator';

export class CreateCategoryTiendaNubeDto {
  @IsObject()
  name: Object;

  @IsOptional()
  @IsNumber()
  parent?: number;

  @IsObject()
  @IsOptional()
  description?: Object;
}
