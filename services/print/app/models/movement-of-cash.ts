import Bank from "./bank"
import Model from "./model"
import PaymentMethod from "./payment-method"
import Transaction from "./transaction"

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
    transaction: Transaction
    receiver?: string
    number?: string
    bank: Bank
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
  