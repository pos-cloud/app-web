import {
  IsDefined,
  IsNumber,
  IsString,
  ValidateIf,
  IsBoolean,
  IsArray,
} from 'class-validator'

import ModelDto from './../../domains/model/model.dto'
import Category from './category.interface'

export default class CategoryDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  public order: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public description: string

  @IsString()
  public picture: string

  @ValidateIf((o) => o.visibleInvoice !== undefined)
  @IsBoolean()
  public visibleInvoice: boolean

  @ValidateIf((o) => o.visibleOnSale !== undefined)
  @IsBoolean()
  public visibleOnSale: boolean

  @ValidateIf((o) => o.visibleOnPurchase !== undefined)
  @IsBoolean()
  public visibleOnPurchase: boolean

  @ValidateIf((o) => o.ecommerceEnabled !== undefined)
  @IsBoolean()
  public ecommerceEnabled: boolean

  @ValidateIf((o) => o.favourite !== undefined)
  @IsBoolean()
  public favourite: boolean

  @ValidateIf((o) => o.applications !== undefined)
  @IsArray()
  public applications: []

  @ValidateIf((o) => o.isRequiredOptional !== undefined)
  @IsBoolean()
  public isRequiredOptional: []

  public parent: Category

  @ValidateIf((o) => o.observation !== undefined)
  @IsString()
  public observation: string

  @ValidateIf((o) => o.wooId !== undefined)
  @IsString()
  public wooId: string
}
