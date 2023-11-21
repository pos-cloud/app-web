import { IsArray, IsObject, IsOptional } from 'class-validator';

export class CreateProductTiendaNubeDTO {
  @IsArray()
  @IsOptional()
  images: Array<any>;

  @IsObject()
  @IsOptional()
  name: Object | any;

  @IsArray()
  @IsOptional()
  categories: Array<any>;

  @IsObject()
  @IsOptional()
  attributes: Object | any;

  @IsObject()
  @IsOptional()
  description: Object | any;
}
