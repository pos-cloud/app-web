import Model from './../../domains/model/model.interface'

export default interface Claim extends Model {
  name: string
  description: string
  type: string
  priority: string
  author: string
  email: string
  listName: string
  file: string
}
