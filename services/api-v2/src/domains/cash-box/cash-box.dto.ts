import {IsDefined, IsNumber, ValidateIf, IsString} from 'class-validator'
import * as moment from 'moment'

import CashBoxType from './../../domains/cash-box-type/cash-box-type.interface'
import Employee from './../../domains/employee/employee.interface'
import ModelDto from './../../domains/model/model.dto'
import {CashBoxState} from './cash-box.interface'

export default class CashBoxDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  public number: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  @ValidateIf((o) => moment(o.openingDate, 'YYYY-MM-DDTHH:mm:ssZ').isValid())
  public openingDate: string

  @ValidateIf((o) => o.closingDate !== undefined)
  @IsString()
  @ValidateIf((o) => moment(o.closingDate, 'YYYY-MM-DDTHH:mm:ssZ').isValid())
  public closingDate: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public state: CashBoxState

  @ValidateIf((o) => !o._id)
  @IsDefined()
  public employee: Employee

  public type: CashBoxType
}
