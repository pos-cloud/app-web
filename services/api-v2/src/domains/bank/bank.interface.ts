import Account from './../../domains/account/account.interface'
import Model from './../../domains/model/model.interface'

export default interface Bank extends Model {
  code: number
  agency: number
  account: Account
  name: string
}
