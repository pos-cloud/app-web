import User from 'domains/user/user.interface'

import Model from './../../domains/model/model.interface'

export default interface Make extends Model {
  description: string
  visibleSale: boolean
  ecommerceEnabled: boolean
  applications: []
  picture: string
  creationUser: User
  creationDate: string
}
