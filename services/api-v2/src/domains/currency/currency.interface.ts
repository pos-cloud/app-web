import Model from './../../domains/model/model.interface'

export default interface Currency extends Model {
  code: string
  sign: string
  name: string
  quotation: number
}
