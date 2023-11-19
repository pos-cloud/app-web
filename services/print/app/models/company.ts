import Model from "./model"
import VATCondition from "./vat-condition"

export default interface Company extends Model {
  name: string
  fantasyName?: string
  entryDate: string
  type: CompanyType
  category?: string
  vatCondition: VATCondition,
  //identificationType: IdentificationType
  identificationValue: string,
  CUIT: string,
  grossIncome?: string
  address?: string
  city?: string
  phones?: string
  emails?: string
  birthday?: Date
  gender?: string
  observation?: string
  allowCurrentAccount?: boolean
  //country?: Country
  floorNumber?: string
  flat?: string
  //state?: State
  addressNumber?: string
  otherFields?: []
  //group?: CompanyGroup
//   employee?: Employee
//   transport?: Transport
//   priceList?: PriceList
  latitude?: string
  longitude?: string
  discount?: number
 // account?: Account
  wooId?: string
  meliId?: string
  creditLimit?: number
  zipCode?: string
}

export enum CompanyType {
  CLIENT = <any>'Cliente',
  PROVIDER = <any>'Proveedor',
}
