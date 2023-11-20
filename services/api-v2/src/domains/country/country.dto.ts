import {IsDefined, IsString, ValidateIf} from 'class-validator'

import ModelDto from './../../domains/model/model.dto'

export default class CountryDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public code: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public name: string

  @ValidateIf((o) => o.callingCodes !== undefined)
  @IsString()
  public callingCodes: string

  @ValidateIf((o) => o.timezones !== undefined)
  @IsString()
  public timezones: string

  @ValidateIf((o) => o.flag !== undefined)
  @IsString()
  public flag: string

  @ValidateIf((o) => o.alpha2Code !== undefined)
  @IsString()
  public alpha2Code: string

  @ValidateIf((o) => o.alpha3Code !== undefined)
  @IsString()
  public alpha3Code: string
}
