import Model from './../../domains/model/model.interface'

export default interface Voucher extends Model {
  date: Date
  token: string
  readings: number
  expirationDate: Date
}
