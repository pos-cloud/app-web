import Model from './../../domains/model/model.interface'

export default interface Session extends Model {
  type: string
  state: string
  date: Date
}
