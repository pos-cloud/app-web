import {IsDefined, IsNumber, IsString, ValidateIf} from 'class-validator'

import EmployeeType from './../../domains/employee-type/employee-type.interface'
import ModelDto from './../../domains/model/model.dto'

export default class EmployeeDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  public code: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public name: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  public type: EmployeeType
}
