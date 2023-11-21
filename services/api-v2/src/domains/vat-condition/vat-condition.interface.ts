import Model from './../../domains/model/model.interface'

export default interface VATCondition extends Model {
  code: number
  description: string
  discriminate: boolean
  observation: string
  transactionLetter: string
}
