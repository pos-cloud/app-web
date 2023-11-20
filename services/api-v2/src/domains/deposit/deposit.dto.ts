import {IsDefined, IsString, ValidateIf, IsNumber, IsBoolean} from 'class-validator'

import Branch from './../../domains/branch/branch.interface'
import ModelDto from './../../domains/model/model.dto'

export default class DepositDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public name: string

  @ValidateIf((o) => o.capacity !== undefined)
  @IsNumber()
  public capacity: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  public branch: Branch

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsBoolean()
  public default: boolean
}
