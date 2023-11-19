import { IsObject, IsOptional, IsNumber } from 'class-validator';

export class CreateCategoryDto {
  @IsObject()
  name: Object;

  @IsOptional()
  @IsNumber()
  parent: number;
}
