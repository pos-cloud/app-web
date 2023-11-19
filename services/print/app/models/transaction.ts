import Company from "./company";
import Model from "./model";
import Taxes from "./tax";
import {  TransactionType } from "./transaction-types";
import VATCondition from "./vat-condition";

export default interface Transaction extends Model {
  origin: number
  letter: string
  number: number
  date: Date
  startDate: Date
  endDate: string
  expirationDate: Date
  VATPeriod: string
  VatCondition: VATCondition
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
  //currency?: Currency
  //deliveryAddress?: Address
  quotation: number
  printed?: number
  //relationType?: RelationType
  // useOfCFDI?: UseOfCFDI
  type: TransactionType
  // cashBox?: CashBox
  // table?: Table
  creationUser?:string
  // employeeOpening?: Employee
  // employeeClosing?: Employee
  // branchOrigin?: Branch
  // branchDestination?: Branch
  // depositOrigin?: Deposit
  // depositDestination?: Deposit
   company?: Company
  // transport?: Transport
  // shipmentMethod?: ShipmentMethod
  // priceList?: PriceList
  // account?: Account
  // businessRules: BusinessRule[]
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
