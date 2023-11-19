import {IsDefined, IsString, IsNumber, ValidateIf} from 'class-validator'

import ModelDto from './../../domains/model/model.dto'

export default class CurrencyDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public code: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public sign: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public name: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  public quotation: number
}
