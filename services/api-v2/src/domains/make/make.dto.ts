import {IsDefined, IsString, ValidateIf, IsBoolean, IsArray} from 'class-validator'

import ModelDto from './../../domains/model/model.dto'

export default class MakeDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public description: string

  @ValidateIf((o) => o.visibleSale !== undefined)
  @IsBoolean()
  public visibleSale: boolean

  @ValidateIf((o) => o.ecommerceEnabled !== undefined)
  @IsBoolean()
  public ecommerceEnabled: boolean

  @ValidateIf((o) => o.applications !== undefined)
  @IsArray()
  public applications: []

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public picture: string
}
