import {IsDefined, IsNumber, IsString, ValidateIf, IsBoolean} from 'class-validator'

import ModelDto from './../../domains/model/model.dto'

export default class BranchDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  public number: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public name: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsBoolean()
  public default: boolean

  @ValidateIf((o) => o.image !== undefined)
  @IsString()
  public image: string
}
