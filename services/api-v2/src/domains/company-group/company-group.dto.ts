import {IsDefined, IsString, ValidateIf} from 'class-validator'

import ModelDto from './../../domains/model/model.dto'

export default class CompanyGroupDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public description: string
  public discount: number
}
