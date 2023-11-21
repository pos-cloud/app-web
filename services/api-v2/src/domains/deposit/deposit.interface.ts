import Branch from './../../domains/branch/branch.interface'
import Model from './../../domains/model/model.interface'

export default interface Deposit extends Model {
  name: string
  capacity: number
  branch: Branch
  default: boolean
}
