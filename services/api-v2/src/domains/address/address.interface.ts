import Company from './../../domains/company/company.interface'
import Model from './../../domains/model/model.interface'

export default interface Address extends Model {
  type?: string
  name: string
  number?: string
  floor?: string
  flat?: string
  postalCode?: string
  city?: string
  state?: string
  country?: string
  latitude?: string
  longitude?: string
  observation?: string
  forBilling?: boolean
  forShipping?: boolean
  company: Company
  shippingStatus: ShippingStatus
}

export enum ShippingStatus {
  Unpacked = <any>  'Desempaquetado',
  Fulfilled = <any> 'Enviado' ,
  Unfulfilled =  <any> 'No enviado'
}
