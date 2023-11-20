import {IsDefined, IsString, ValidateIf} from 'class-validator'

import Country from './../../domains/country/country.interface'
import ModelDto from './../../domains/model/model.dto'

export default class StateDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public code: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public name: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  public country: Country
}
