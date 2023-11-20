import Model from './../../domains/model/model.interface'

export default interface Resource extends Model {
  name: string
  type: string
  file: string
}
