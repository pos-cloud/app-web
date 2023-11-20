import {IsDefined, IsString, ValidateIf, IsEmail} from 'class-validator'

import Company from './../../domains/company/company.interface'
import ModelDto from './../../domains/model/model.dto'

export default class CompanyConctactDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public name: string

  @ValidateIf((o) => o.phone !== undefined)
  @IsString()
  public phone: string

  @ValidateIf((o) => o.phone !== undefined)
  @IsString()
  @IsEmail()
  public email: string

  @ValidateIf((o) => o.position !== undefined)
  @IsString()
  public position: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  public company: Company
}
