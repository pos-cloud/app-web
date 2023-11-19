import Branch from './../../domains/branch/branch.interface'
import Model from './../../domains/model/model.interface'

export default interface Origin extends Model {
  number: number
  branch: Branch
}
