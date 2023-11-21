import {IsDefined, IsString, ValidateIf} from 'class-validator'

import ModelDto from './../../domains/model/model.dto'

export default class RelationTypeDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public code: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public description: string
}
