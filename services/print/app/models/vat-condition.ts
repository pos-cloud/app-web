import Model from './model'

export default interface VATCondition extends Model {
  code: number
  description: string
  discriminate: boolean
  observation: string
  transactionLetter: string
}
