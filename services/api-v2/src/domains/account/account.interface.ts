import Model from './../../domains/model/model.interface'

export default interface Account extends Model {
  code?: string
  description?: string
  parent?: Account
  mode?: string
  type?: string
}
