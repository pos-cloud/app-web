import Company from './../../domains/company/company.interface'
import Model from './../../domains/model/model.interface'

export default interface CompanyNew extends Model {
  date: Date
  news: string
  state: string
  company: Company
}
