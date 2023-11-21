import {
  IsDefined,
  IsNumber,
  IsString,
  ValidateIf,
  IsBoolean,
  IsArray,
} from 'class-validator'

import Article from './../../domains/article/article.interface'
import Category from './../../domains/category/category.interface'
import Make from './../../domains/make/make.interface'
import ModelDto from './../../domains/model/model.dto'

export default class PriceListDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  name: string

  @ValidateIf((o) => o.percentage !== undefined)
  @IsNumber()
  percentage: number

  @ValidateIf((o) => o.default !== undefined)
  @IsBoolean()
  default: boolean

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsBoolean()
  allowSpecialRules: boolean

  @ValidateIf((o) => o.rules !== undefined)
  @IsArray()
  rules: {
    category: Category
    make: Make
    percentage: number
  }[]

  @ValidateIf((o) => o.exceptions !== undefined)
  @IsArray()
  exceptions: {
    article: Article
    percentage: number
  }[]
}
