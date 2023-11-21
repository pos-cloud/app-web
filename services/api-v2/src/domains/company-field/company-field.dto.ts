import {IsDefined, IsString, ValidateIf} from 'class-validator'

import ModelDto from './../../domains/model/model.dto'

export default class CompanyFieldsDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public name: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public datatype: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public value: string
}
