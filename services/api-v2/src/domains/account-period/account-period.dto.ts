import {IsDefined, IsString, ValidateIf} from 'class-validator'
import * as moment from 'moment'

import ModelDto from '../model/model.dto'

import Account from './../../domains/account/account.interface'

export default class AccountPeriodDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public description: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public status: string

  @ValidateIf((o) => o.date !== undefined)
  @IsString()
  @ValidateIf((o) => moment(o.startDate, 'YYYY-MM-DDTHH:mm:ssZ').isValid())
  public startDate: string

  @ValidateIf((o) => o.date !== undefined)
  @IsString()
  @ValidateIf((o) => moment(o.startDate, 'YYYY-MM-DDTHH:mm:ssZ').isValid())
  public endDate: Account
}
