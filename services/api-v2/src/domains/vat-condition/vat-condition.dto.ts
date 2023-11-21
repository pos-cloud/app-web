import {IsDefined, IsNumber, IsString, IsBoolean, ValidateIf} from 'class-validator'

import ModelDto from './../../domains/model/model.dto'

export default class VATConditionDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  public code: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public description: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsBoolean()
  public discriminate: boolean

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  public transactionLetter: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public observation: string
}
