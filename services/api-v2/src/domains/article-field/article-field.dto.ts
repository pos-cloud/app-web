import {IsDefined, IsString, IsNumber, IsBoolean, ValidateIf} from 'class-validator'

import ModelDto from './../../domains/model/model.dto'

export default class ArticleFieldDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  public order: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public name: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public datatype: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public value: string

  @ValidateIf((o) => o.modify !== undefined)
  @IsBoolean()
  public modify: boolean

  @ValidateIf((o) => o.modifyVAT !== undefined)
  @IsBoolean()
  public modifyVAT: boolean

  @ValidateIf((o) => o.discriminateVAT !== undefined)
  @IsBoolean()
  public discriminateVAT: boolean

  @ValidateIf((o) => o.ecommerceEnabled !== undefined)
  @IsBoolean()
  public ecommerceEnabled: boolean

  @ValidateIf((o) => o.wooId !== undefined)
  @IsString()
  public wooId: boolean
}
