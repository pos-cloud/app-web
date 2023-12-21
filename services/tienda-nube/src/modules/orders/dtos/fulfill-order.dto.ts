import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class FulFillOrderDto {
  @IsNumber()
  shipping_tracking_number: number;

  @IsString()
  shipping_tracking_url: string;

  @IsBoolean()
  @IsOptional()
  notify_customer: boolean;

  @IsNumber()
  storeId: number;
}
