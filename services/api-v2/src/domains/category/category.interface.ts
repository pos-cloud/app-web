import Application from 'domains/application/application.interface'
import User from 'domains/user/user.interface'

import Model from './../../domains/model/model.interface'

export default interface Category extends Model {
  creationDate: string
  creationUser: User
  order: number
  description: string
  picture: string
  visibleInvoice: boolean
  visibleOnSale: boolean
  visibleOnPurchase: boolean
  ecommerceEnabled: boolean
  favourite: boolean
  applications: Application[]
  isRequiredOptional: []
  parent: Category
  observation: string
  wooId: string
  showMenu: boolean
}
