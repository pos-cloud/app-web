import Model from './../../domains/model/model.interface'

export default interface CompanyFields extends Model {
  name: string
  datatype: string
  value: string
}
