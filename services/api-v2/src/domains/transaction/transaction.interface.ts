import BusinessRule from 'domains/business-rule/business-rule.interface'

import Account from './../../domains/account/account.interface'
import Address from './../../domains/address/address.interface'
import Branch from './../../domains/branch/branch.interface'
import CashBox from './../../domains/cash-box/cash-box.interface'
import Company from './../../domains/company/company.interface'
import Currency from './../../domains/currency/currency.interface'
import Deposit from './../../domains/deposit/deposit.interface'
import Employee from './../../domains/employee/employee.interface'
import Model from './../../domains/model/model.interface'
import PriceList from './../../domains/price-list/price-list.interface'
import RelationType from './../../domains/relation-type/relation-type.interface'
import {ShipmentMethod} from './../../domains/shipment-method/shipment-method.interface'
import Table from './../../domains/table/table.interface'
import Taxes from './../../domains/tax/taxes.interface'
import {TransactionType} from './../../domains/transaction-type/transaction-type.interface'
import Transport from './../../domains/transport/transport.interface'
import UseOfCFDI from './../../domains/use-of-CFDI/use-of-CFDI.interface'

export default interface Transaction extends Model {
  origin: number
  letter: string
  number: number
  date: Date
  startDate: Date
  endDate: Date
  expirationDate: Date
  VATPeriod: string
  observation?: string
  basePrice: number
  exempt: number
  discountAmount?: number
  discountPercent?: number
  commissionAmount?: number
  administrativeExpenseAmount?: number
  otherExpenseAmount?: number
  taxes?: Taxes[]
  totalPrice: number
  roundingAmount?: number
  diners?: number
  orderNumber?: number
  state: TransactionState
  madein?: string
  balance: number
  CAE?: string
  CAEExpirationDate?: Date
  stringSAT?: string
  CFDStamp?: string
  SATStamp?: string
  UUID?: string
  wooId?: string
  meliId?: string
  currency?: Currency
  deliveryAddress?: Address
  quotation: number
  printed?: number
  relationType?: RelationType
  useOfCFDI?: UseOfCFDI
  type: TransactionType
  cashBox?: CashBox
  table?: Table
  creationUser?:string
  employeeOpening?: Employee
  employeeClosing?: Employee
  branchOrigin?: Branch
  branchDestination?: Branch
  depositOrigin?: Deposit
  depositDestination?: Deposit
  company?: Company
  transport?: Transport
  shipmentMethod?: ShipmentMethod
  priceList?: PriceList
  account?: Account
  businessRules: BusinessRule[]
  tracking?: {
    date: Date
    state: string
  }[]
  optionalAFIP: {
    id: string
    value: string
  }
  paymentMethodEcommerce?: string
  declaredValue?: number
  tiendaNubeId?: string,
  package?: number
}

export enum TransactionState {
  Open = <any>'Abierto',
  Outstanding = <any>'Pendiente de pago',
  PaymentConfirmed = <any>'Pago Confirmado',
  PaymentDeclined = <any>'Pago Rechazado',
  Canceled = <any>'Anulado',
  Packing = <any>'Armando',
  Closed = <any>'Cerrado',
  Delivered = <any>'Entregado',
  Sent = <any>'Enviado',
  Preparing = <any>'Preparando',
  Pending = <any>'Pendiente',
}
