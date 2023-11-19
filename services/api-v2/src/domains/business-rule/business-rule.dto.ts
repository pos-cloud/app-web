import {IsDefined, IsString, IsNumber, ValidateIf, IsBoolean, Min} from 'class-validator'

import Article from '../article/article.interface'
import ModelDto from '../model/model.dto'

import {Day} from './business-rule.interface'

export default class BusinessRulesDto extends ModelDto {
  code: string

  @IsDefined()
  @IsString()
  name: string

  @ValidateIf((o) => o.description)
  @IsString()
  description: string

  @ValidateIf((o) => o.termsAndConditions)
  @IsString()
  termsAndConditions: string

  @ValidateIf((o) => o.startDate)
  @IsString()
  startDate: string

  @ValidateIf((o) => o.endDate)
  @IsString()
  endDate: string

  @ValidateIf((o) => o.minAmount !== undefined && o.minAmount !== null)
  @IsNumber()
  @Min(0)
  minAmount: number

  @ValidateIf((o) => o.minQuantity !== undefined && o.minQuantity !== null)
  @IsNumber()
  @Min(0)
  minQuantity: number

  @ValidateIf(
    (o) => o.transactionAmountLimit !== undefined && o.transactionAmountLimit !== null,
  )
  @IsNumber()
  @Min(0)
  transactionAmountLimit: number

  @IsDefined()
  @IsNumber()
  @Min(1)
  totalStock: number

  @ValidateIf((o) => o.currentStock !== undefined && o.currentStock !== null)
  @IsNumber()
  @Min(0)
  currentStock: number

  @ValidateIf((o) => o.madeIn)
  @IsString()
  madeIn: string

  @ValidateIf((o) => o.active !== undefined && o.active !== null)
  @IsBoolean()
  active: boolean

  @IsDefined()
  discountType: DiscountType

  @ValidateIf(
    (o) =>
      o.discountType === DiscountType.Percentage ||
      o.discountType === DiscountType.Amount,
  )
  @IsDefined()
  @IsNumber()
  @Min(1)
  discountValue: number

  @IsDefined()
  article: Article

  item: Article

  item2: Article

  item3: Article

  transactionTypeIds: string[]

  days: Day[]
}

export enum DiscountType {
  Percentage = 'percentage',
  Amount = 'amount',
}
