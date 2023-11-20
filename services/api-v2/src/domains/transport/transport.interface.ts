import CompanyGroup from './../../domains/company-group/company-group.interface'
import Country from './../../domains/country/country.interface'
import IdentificationType from './../../domains/identification-type/identification-type.interface'
import Model from './../../domains/model/model.interface'
import State from './../../domains/state/state.interface'
import VATCondition from './../../domains/vat-condition/vat-condition.interface'

export default interface Transport extends Model {
  code: number
  name: string
  fantasyName: string
  vatCondition: VATCondition
  identificationType: IdentificationType
  identificationValue: string
  grossIncome: string
  address: string
  city: string
  phones: string
  emails: string
  observation: string
  allowCurrentAccount: string
  country: Country
  floorNumber: string
  flat: string
  state: State
  addressNumber: string
  group: CompanyGroup
}
