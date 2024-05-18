import { IsObject, IsOptional, IsNumber } from 'class-validator';

export class UpdateCategoryTiendaNubeDto {
    @IsOptional()
    @IsNumber()
    id?: number;

    @IsOptional()
    @IsNumber()
    parent?: number;

    @IsObject()
    name: Object;
}
