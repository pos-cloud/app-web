import Model from './../../domains/model/model.interface'

export default interface CurrencyValue extends Model {
  name: string
  value: number
}
