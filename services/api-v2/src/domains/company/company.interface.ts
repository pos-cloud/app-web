import Account from './../../domains/account/account.interface'
import CompanyGroup from './../../domains/company-group/company-group.interface'
import Country from './../../domains/country/country.interface'
import Employee from './../../domains/employee/employee.interface'
import IdentificationType from './../../domains/identification-type/identification-type.interface'
import Model from './../../domains/model/model.interface'
import PriceList from './../../domains/price-list/price-list.interface'
import State from './../../domains/state/state.interface'
import Transport from './../../domains/transport/transport.interface'
import VATCondition from './../../domains/vat-condition/vat-condition.interface'

export default interface Company extends Model {
  name: string
  fantasyName?: string
  entryDate: string
  type: CompanyType
  category?: string
  vatCondition: VATCondition
  identificationType: IdentificationType
  identificationValue: string
  grossIncome?: string
  address?: string
  city?: string
  phones?: string
  emails?: string
  birthday?: Date
  gender?: string
  observation?: string
  allowCurrentAccount?: boolean
  country?: Country
  floorNumber?: string
  flat?: string
  state?: State
  addressNumber?: string
  otherFields?: []
  group?: CompanyGroup
  employee?: Employee
  transport?: Transport
  priceList?: PriceList
  latitude?: string
  longitude?: string
  discount?: number
  account?: Account
  wooId?: string
  meliId?: string
  creditLimit?: number
  zipCode?: string
}

export enum CompanyType {
  CLIENT = <any>'Cliente',
  PROVIDER = <any>'Proveedor',
}
