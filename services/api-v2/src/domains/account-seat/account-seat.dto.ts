import {IsString, ValidateIf} from 'class-validator'
import * as moment from 'moment'

import ModelDto from '../model/model.dto'

import AccountPeriod from './../../domains/account-period/account-period.interface'
import Account from './../../domains/account/account.interface'
import Transaction from './../../domains/transaction/transaction.interface'

export default class AccountSeatDto extends ModelDto {
  @ValidateIf((o) => o.date !== undefined)
  @IsString()
  @ValidateIf((o) => moment(o.date, 'YYYY-MM-DDTHH:mm:ssZ').isValid())
  public date: string

  public observation: string
  public items: {
    account: Account
    debit: number
    credit: number
  }[]
  public period: AccountPeriod

  public transaction: Transaction
}
