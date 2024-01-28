import Bank from './../../domains/bank/bank.interface'
import Model from './../../domains/model/model.interface'
import PaymentMethod from './../../domains/payment-method/payment-method.interface'
import Transaction from './../../domains/transaction/transaction.interface'

export default interface MovementOfCash extends Model {
  date: Date
  expirationDate: Date
  statusCheck?: StatusCheck
  discount?: number
  surcharge?: number
  commissionAmount?: number
  administrativeExpenseAmount?: number
  otherExpenseAmount?: number
  quota?: number
  capital?: number
  interestPercentage?: number
  interestAmount?: number
  taxPercentage?: number
  taxAmount?: number
  amountPaid: number
  amountDiscount: number
  balanceCanceled?: number
  cancelingTransaction?: Transaction
  observation?: string
  type: PaymentMethod
  status: PaymentStatus
  transaction: Transaction
  receiver?: string
  number?: string
  bank?: Bank
  titular?: string
  CUIT?: string
  deliveredBy?: string
  paymentChange?: number
  currencyValues?: {
    value: number
    quantity: number
  }[]
  tokenMP?: string
  paymentMP?: string
}

export enum StatusCheck {
  Rejected = <any>'Rechazado',
  Closed = <any>'Cerrado',
  Deposit = <any>'Depositado',
  Available = <any>'Disponible',
}

export enum PaymentStatus {
  Authorized = <any> 'Autorizado',
  Pending = <any> 'Pendiente',
  Paid = <any> 'Pagado',
  Abandoned = <any> 'Abandonado',
  Refunded = <any> 'Reembolso',
  Voided = <any>'Anulado'
}
