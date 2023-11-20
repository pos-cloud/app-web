import Model from './../../domains/model/model.interface'
import {TransactionType} from './../../domains/transaction-type/transaction-type.interface'

export default interface CancellationType extends Model {
  origin: TransactionType
  destination: TransactionType
  automaticSelection: boolean
  modifyBalance: boolean
  requestAutomatic: boolean
  requestCompany: boolean
  requestStatusOrigin: string
  stateOrigin: string
  updatePrices: boolean
}
