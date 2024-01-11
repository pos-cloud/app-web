import {IsDefined, IsString, ValidateIf, IsNumber} from 'class-validator'
import * as moment from 'moment'

import Bank from './../../domains/bank/bank.interface'
import ModelDto from './../../domains/model/model.dto'
import PaymentMethod from './../../domains/payment-method/payment-method.interface'
import Transaction from './../../domains/transaction/transaction.interface'
import 'moment/locale/es'
import { PaymentStatus } from './movement-of-cash.interface'

export default class MovementOfCashDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @ValidateIf((o) => moment(o.date, 'YYYY-MM-DDTHH:mm:ssZ').isValid())
  date: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  @ValidateIf((o) => moment(o.expirationDate, 'YYYY-MM-DDTHH:mm:ssZ').isValid())
  expirationDate: string

  statusCheck: string

  @ValidateIf((o) => o.discount !== undefined)
  @IsNumber()
  discount: number

  @ValidateIf((o) => o.surcharge !== undefined)
  @IsNumber()
  surcharge: number

  @ValidateIf((o) => o.commissionAmount !== undefined)
  @IsNumber()
  commissionAmount: number

  @ValidateIf((o) => o.administrativeExpenseAmount !== undefined)
  @IsNumber()
  administrativeExpenseAmount: number

  @ValidateIf((o) => o.otherExpenseAmount !== undefined)
  @IsNumber()
  otherExpenseAmount: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  quota: number

  @ValidateIf((o) => o.capital !== undefined)
  @IsNumber()
  capital: number

  @ValidateIf((o) => o.interestPercentage !== undefined)
  @IsNumber()
  interestPercentage: number

  @ValidateIf((o) => o.interestAmount !== undefined)
  @IsNumber()
  interestAmount: number

  @ValidateIf((o) => o.taxPercentage !== undefined)
  @IsNumber()
  taxPercentage: number

  @ValidateIf((o) => o.taxAmount !== undefined)
  @IsNumber()
  taxAmount: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  amountPaid: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  amountDiscount: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  balanceCanceled: number

  @ValidateIf((o) => o.cancelingTransaction !== undefined)
  cancelingTransaction: Transaction

  @ValidateIf((o) => o.observation !== undefined)
  @IsString()
  observation: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  type: PaymentMethod

  @ValidateIf((o) => !o._id)
  @IsDefined()
  transaction: Transaction

  @ValidateIf((o) => o.receiver !== undefined)
  @IsString()
  receiver: string

  @ValidateIf((o) => o.number !== undefined)
  @IsString()
  number: string

  @ValidateIf((o) => o.bank !== undefined)
  bank: Bank

  @ValidateIf((o) => o.titular !== undefined)
  @IsString()
  titular: string

  @ValidateIf((o) => o.paymentStatus !== undefined)
  @IsString()
  paymentStatus: PaymentStatus

  @ValidateIf((o) => o.CUIT !== undefined)
  @IsString()
  CUIT: string

  @ValidateIf((o) => o.deliveredBy !== undefined)
  @IsString()
  deliveredBy: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  paymentChange: number

  currencyValues: {
    value: number
    quantity: number
  }[]

  tokenMP: string
  paymentMP: string
}
