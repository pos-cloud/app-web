import Model from './../../domains/model/model.interface'

export default interface Holiday extends Model {
  name: string
  date: Date
}
