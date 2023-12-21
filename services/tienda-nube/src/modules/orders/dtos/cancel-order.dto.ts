import { IsBoolean, IsEnum, IsNumber, IsOptional } from 'class-validator';

export class CancelOrderDto {
  @IsOptional()
  @IsEnum(['customer', 'inventory', 'fraud', 'other'])
  reason: string;

  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @IsOptional()
  @IsBoolean()
  restock?: boolean;

  @IsNumber()
  storeId: number;
}
