import CancellationType from 'domains/cancellation-type/cancellation-type.interface'

import Model from './../../domains/model/model.interface'
import Transaction from './../../domains/transaction/transaction.interface'

export default interface MovementOfCancellation extends Model {
  transactionOrigin: Transaction
  transactionDestination: Transaction
  balance: number
  type: CancellationType
}
