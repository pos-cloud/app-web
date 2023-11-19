import {IsDefined, IsString, IsNumber, ValidateIf} from 'class-validator'

import ModelDto from './../../domains/model/model.dto'

export default class CurrencyValueDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public name: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  public value: number
}
