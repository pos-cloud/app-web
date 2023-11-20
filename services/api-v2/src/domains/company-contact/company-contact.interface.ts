import Company from './../../domains/company/company.interface'
import Model from './../../domains/model/model.interface'

export default interface CompanyConctact extends Model {
  name: string
  phone: string
  email: string
  position: string
  company: Company
}
