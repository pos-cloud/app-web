import {IsDefined, IsString, ValidateIf} from 'class-validator'

import ModelDto from './../../domains/model/model.dto'

export default class IdentificationTypeDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public code: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public name: string
}
