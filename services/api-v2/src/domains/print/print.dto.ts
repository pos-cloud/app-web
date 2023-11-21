import {IsDefined, IsString, ValidateIf} from 'class-validator'

import ModelDto from './../../domains/model/model.dto'

export default class PrintDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public name: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public content: string
}
