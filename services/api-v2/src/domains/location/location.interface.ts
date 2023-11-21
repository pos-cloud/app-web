import Deposit from './../../domains/deposit/deposit.interface'
import Model from './../../domains/model/model.interface'

export default interface Location extends Model {
  description: string
  positionX: string
  positionY: string
  positionZ: string
  deposit: Deposit
}
