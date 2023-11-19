import {IsDefined, IsString, ValidateIf} from 'class-validator'

import Deposit from './../../domains/deposit/deposit.interface'
import ModelDto from './../../domains/model/model.dto'

export default class LocationDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public description: string

  @ValidateIf((o) => o.positionX !== undefined)
  @IsString()
  public positionX: string

  @ValidateIf((o) => o.positionY !== undefined)
  @IsString()
  public positionY: string

  @ValidateIf((o) => o.positionZ !== undefined)
  @IsString()
  public positionZ: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  public deposit: Deposit
}
