import {IsDefined, IsString, ValidateIf} from 'class-validator'

import ModelDto from './../../domains/model/model.dto'

export default class ResourceDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public name: string

  @ValidateIf((o) => o.type !== undefined)
  @IsString()
  public type: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public file: string
}
