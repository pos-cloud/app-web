import Model from './../../domains/model/model.interface'

export default interface CompanyGroup extends Model {
  description: string
  discount: number
}
