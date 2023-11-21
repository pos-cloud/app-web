import {IsDefined, IsNumber, ValidateIf} from 'class-validator'

import Branch from './../../domains/branch/branch.interface'
import ModelDto from './../../domains/model/model.dto'

export default class OriginDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  public number: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  public branch: Branch
}
