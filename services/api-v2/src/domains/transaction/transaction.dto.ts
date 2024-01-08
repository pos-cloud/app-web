
import {IsDefined, IsString, IsNumber, ValidateIf, IsArray, Min} from 'class-validator'
import * as moment from 'moment'

import Account from './../../domains/account/account.interface'
import Address from './../../domains/address/address.interface'
import Branch from './../../domains/branch/branch.interface'
import BusinessRule from './../../domains/business-rule/business-rule.interface'
import CashBox from './../../domains/cash-box/cash-box.interface'
import Company from './../../domains/company/company.interface'
import Currency from './../../domains/currency/currency.interface'
import Deposit from './../../domains/deposit/deposit.interface'
import Employee from './../../domains/employee/employee.interface'
import ModelDto from './../../domains/model/model.dto'
import PriceList from './../../domains/price-list/price-list.interface'
import RelationType from './../../domains/relation-type/relation-type.interface'
import {ShipmentMethod} from './../../domains/shipment-method/shipment-method.interface'
import Table from './../../domains/table/table.interface'
import Tax from './../../domains/tax/tax.interface'
import {TransactionType} from './../../domains/transaction-type/transaction-type.interface'
import Transport from './../../domains/transport/transport.interface'
import UseOfCFDI from './../../domains/use-of-CFDI/use-of-CFDI.interface'
import 'moment/locale/es'
import { TransactionState} from './transaction.interface'

export default class TransactionDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  @Min(0)
  origin: number

  @ValidateIf((o) => o.letter)
  @IsString()
  letter: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  @Min(0)
  number: number

  @ValidateIf((o) => o.date !== undefined)
  @IsString()
  @ValidateIf((o) => moment(o.startDate, 'YYYY-MM-DDTHH:mm:ssZ').isValid())
  date: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  @ValidateIf((o) => moment(o.startDate, 'YYYY-MM-DDTHH:mm:ssZ').isValid())
  startDate: string

  @ValidateIf((o) => o.endDate !== undefined)
  @IsString()
  @ValidateIf((o) => moment(o.startDate, 'YYYY-MM-DDTHH:mm:ssZ').isValid())
  endDate: string

  @ValidateIf((o) => o.expirationDate !== undefined)
  @IsString()
  @ValidateIf((o) => moment(o.startDate, 'YYYY-MM-DDTHH:mm:ssZ').isValid())
  expirationDate: string

  @ValidateIf((o) => o.VATPeriod !== undefined)
  @IsString()
  VATPeriod: string

  @ValidateIf((o) => o.observation !== undefined)
  @IsString()
  observation: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  basePrice: number

  @ValidateIf((o) => o.exempt !== undefined)
  @IsNumber()
  exempt: number

  @ValidateIf((o) => o.discountAmount !== undefined)
  @IsNumber()
  discountAmount: number

  @ValidateIf((o) => o.discountPercent !== undefined)
  @IsNumber()
  discountPercent: number

  @ValidateIf((o) => o.commissionAmount !== undefined)
  @IsNumber()
  commissionAmount: number

  @ValidateIf((o) => o.administrativeExpenseAmount !== undefined)
  @IsNumber()
  administrativeExpenseAmount: number

  @ValidateIf((o) => o.otherExpenseAmount !== undefined)
  @IsNumber()
  otherExpenseAmount: number

  @ValidateIf((o) => o.taxes !== undefined)
  @IsArray()
  taxes: {
    tax: Tax
    percentage: number
    taxBase: number
    taxAmount: number
  }[]

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  totalPrice: number

  @ValidateIf((o) => o.roundingAmount !== undefined)
  @IsNumber()
  roundingAmount: number

  @ValidateIf((o) => o.diners !== undefined)
  @IsNumber()
  diners: number

  @ValidateIf((o) => o.orderNumber !== undefined)
  @IsNumber()
  orderNumber: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  state: TransactionState

  @ValidateIf((o) => o.wooId !== undefined)
  @IsString()
  wooId: string

  @ValidateIf((o) => o.meliId !== undefined)
  @IsString()
  meliId: string

  @ValidateIf((o) => o.tiendaNubeId !== undefined)
  @IsString()
  tiendaNubeId: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  madein: string

  @ValidateIf((o) => o.balance !== undefined)
  @IsNumber()
  balance: number

  @ValidateIf((o) => o.CAE !== undefined)
  @IsString()
  CAE: string

  @ValidateIf((o) => o.CAEExpirationDate !== undefined)
  @IsString()
  @ValidateIf((o) => moment(o.startDate, 'YYYY-MM-DDTHH:mm:ssZ').isValid())
  CAEExpirationDate: string

  @ValidateIf((o) => o.stringSAT !== undefined)
  @IsString()
  stringSAT: string

  @ValidateIf((o) => o.CFDStamp !== undefined)
  @IsString()
  CFDStamp: string

  @ValidateIf((o) => o.SATStamp !== undefined)
  @IsString()
  SATStamp: string

  @ValidateIf((o) => o.UUID !== undefined)
  @IsString()
  UUID: string

  currency: Currency

  deliveryAddress: Address

  @ValidateIf((o) => o.quotation != null || o.quotation != undefined)
  @IsNumber()
  quotation: number

  @ValidateIf((o) => o.printed != null || o.printed != undefined)
  @IsNumber()
  printed: number

  relationType: RelationType

  useOfCFDI: UseOfCFDI

  @ValidateIf((o) => !o._id)
  @IsDefined()
  type: TransactionType

  cashBox: CashBox

  table: Table

  employeeOpening: Employee

  employeeClosing: Employee

  @ValidateIf((o) => !o._id)
  branchOrigin: Branch

  @ValidateIf((o) => !o._id)
  branchDestination: Branch

  depositOrigin: Deposit

  depositDestination: Deposit

  company: Company

  transport: Transport

  shipmentMethod: ShipmentMethod

  priceList: PriceList

  businessRules: BusinessRule[]

  paymentMethodEcommerce: string

  @ValidateIf((o) => o.tracking !== undefined)
  @IsArray()
  tracking: {
    date: Date
    state: string
  }[]

  declaredValue: number
  package: number
  account: Account
  optionalAFIP: {
    id: string
    value: string
  }
}