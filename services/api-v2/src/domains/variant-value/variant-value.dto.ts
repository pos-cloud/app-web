import {IsDefined, IsString, IsNumber, ValidateIf} from 'class-validator'

import ModelDto from './../../domains/model/model.dto'
import VariantType from './../../domains/variant-type/variant-type.interface'

export default class VariantValueDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  public type: VariantType

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  public order: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public description: string

  public picture: string
}
