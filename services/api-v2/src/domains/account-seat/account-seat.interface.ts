import Model from '../model/model.interface'

import AccountPeriod from './../../domains/account-period/account-period.interface'
import Account from './../../domains/account/account.interface'
import Transaction from './../../domains/transaction/transaction.interface'

export default interface AccountSeat extends Model {
  date?: Date
  period?: AccountPeriod
  transaction?: Transaction
  observation?: string
  items?: [
    {
      account: Account
      debit: number
      credit: number
    },
  ]
}
