import Model from './../../domains/model/model.interface'

export default interface Branch extends Model {
  number: number
  name: string
  default: boolean
  image: string
}
