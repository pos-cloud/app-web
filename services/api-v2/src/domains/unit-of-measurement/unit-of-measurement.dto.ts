import {IsDefined, IsString, ValidateIf} from 'class-validator'

import ModelDto from './../../domains/model/model.dto'

export default class UnitOfMeasurementDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public code: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public abbreviation: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public name: string
}
