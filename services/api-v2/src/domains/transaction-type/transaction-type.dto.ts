import {
  IsDefined,
  IsString,
  IsNumber,
  ValidateIf,
  IsBoolean,
  IsArray,
  IsNotEmpty,
} from 'class-validator'
import * as moment from 'moment'

import Application from './../../domains/application/application.interface'
import Branch from './../../domains/branch/branch.interface'
import CashBoxType from './../../domains/cash-box-type/cash-box-type.interface'
import Company from './../../domains/company/company.interface'
import EmailTemplate from './../../domains/email-template/email-template.interface'
import EmployeeType from './../../domains/employee-type/employee-type.interface'
import ModelDto from './../../domains/model/model.dto'
import PaymentMethod from './../../domains/payment-method/payment-method.interface'
import Printer from './../../domains/printer/printer.interface'
import {ShipmentMethod} from './../../domains/shipment-method/shipment-method.interface'
import UseOfCFDI from './../../domains/use-of-CFDI/use-of-CFDI.interface'
import 'moment/locale/es'
import {Match} from './custom-validator'

export default class TransactionTypeDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  public order: number

  public branch: Branch

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public transactionMovement: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public abbreviation: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public name: string

  @ValidateIf((o) => o.labelPrint !== undefined)
  @IsString()
  public labelPrint: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public currentAccount: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public movement: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsBoolean()
  public modifyStock: boolean

  @ValidateIf((o) => o.modifyStock == true)
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public stockMovement: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsBoolean()
  public requestArticles: boolean

  @ValidateIf((o) => o.modifyArticle !== undefined)
  @IsBoolean()
  public modifyArticle: boolean

  @ValidateIf((o) => o.entryAmount !== undefined)
  public entryAmount: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsBoolean()
  public requestTaxes: boolean

  @ValidateIf((o) => o.defectOrders !== undefined)
  @IsBoolean()
  public defectOrders: boolean

  @ValidateIf((o) => o.allowAPP !== undefined)
  @IsBoolean()
  public allowAPP: boolean

  @ValidateIf((o) => o.allowTransactionClose !== undefined)
  @IsBoolean()
  public allowTransactionClose: boolean

  @ValidateIf((o) => o.allowEdit !== undefined)
  @IsBoolean()
  public allowEdit: boolean

  @ValidateIf((o) => o.allowDelete !== undefined)
  @IsBoolean()
  public allowDelete: boolean

  @ValidateIf((o) => o.allowZero !== undefined)
  @IsBoolean()
  public allowZero: boolean

  @ValidateIf((o) => o.allowCompanyDiscount !== undefined)
  @IsBoolean()
  public allowCompanyDiscount: boolean

  @ValidateIf((o) => o.electronics !== undefined)
  @IsBoolean()
  public electronics: boolean

  @ValidateIf((o) => o.codes !== undefined)
  @IsArray()
  public codes: []

  @ValidateIf((o) => o.fiscalCode !== undefined)
  @IsString()
  public fiscalCode: string

  @ValidateIf((o) => o.fixedOrigin !== undefined)
  @IsNumber()
  public fixedOrigin: number

  @ValidateIf((o) => o.fixedLetter !== undefined)
  @IsString()
  public fixedLetter: string

  @ValidateIf((o) => o.maxOrderNumber !== undefined)
  @IsNumber()
  public maxOrderNumber: number

  @ValidateIf((o) => o.tax !== undefined)
  @IsBoolean()
  public tax: boolean

  @ValidateIf((o) => o.cashBoxImpact !== undefined)
  @IsBoolean()
  public cashBoxImpact: boolean

  @ValidateIf((o) => o.cashOpening !== undefined)
  @IsBoolean()
  public cashOpening: boolean

  @ValidateIf((o) => o.cashClosing !== undefined)
  @IsBoolean()
  public cashClosing: boolean

  @ValidateIf((o) => o.requestPaymentMethods !== undefined)
  @IsBoolean()
  public requestPaymentMethods: boolean

  @ValidateIf((o) => o.showKeyboard !== undefined)
  @IsBoolean()
  public showKeyboard: boolean

  @ValidateIf((o) => o.requestCurrency !== undefined)
  @IsBoolean()
  public requestCurrency: boolean

  @ValidateIf((o) => o.requestTransport !== undefined)
  @IsBoolean()
  public requestTransport: boolean

  @ValidateIf((o) => o.showPrices !== undefined)
  @IsBoolean()
  public showPrices: boolean

  @ValidateIf((o) => o.automaticNumbering !== undefined)
  @IsBoolean()
  public automaticNumbering: boolean

  @ValidateIf((o) => o.automaticCreation !== undefined)
  @IsBoolean()
  public automaticCreation: boolean

  public requestEmployee: EmployeeType

  @ValidateIf((o) => {
    if (o.requestCompany === null && o.company) {
      return true
    } else {
      return false
    }
  })
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNotEmpty()
  public requestCompany: string

  public fastPayment: PaymentMethod

  @ValidateIf((o) => o.printable !== undefined)
  @IsBoolean()
  public printable: boolean

  public defectPrinter: Printer

  public defectUseOfCFDI: UseOfCFDI

  @ValidateIf((o) => o.isPreprinted !== undefined)
  @IsBoolean()
  public isPreprinted: boolean

  @ValidateIf((o) => o.showPriceType !== undefined)
  @IsString()
  public showPriceType: string

  @ValidateIf((o) => o.showDescriptionType !== undefined)
  @IsString()
  public showDescriptionType: string

  @ValidateIf((o) => o.printDescriptionType !== undefined)
  @IsString()
  public printDescriptionType: string

  @ValidateIf((o) => o.printSign !== undefined)
  @IsBoolean()
  public printSign: boolean

  @ValidateIf((o) => o.posKitchen !== undefined)
  @IsBoolean()
  public posKitchen: boolean

  @ValidateIf((o) => o.finishCharge !== undefined)
  @IsBoolean()
  public finishCharge: boolean

  @ValidateIf((o) => o.readLayout !== undefined)
  @IsBoolean()
  public readLayout: boolean

  @ValidateIf((o) => o.expirationDate !== undefined)
  @IsString()
  @ValidateIf((o) => moment(o.expirationDate, 'YYYY-MM-DDTHH:mm:ssZ').isValid())
  public expirationDate: string

  public updatePrice: string

  @ValidateIf((o) => o.updateArticle !== undefined)
  @IsBoolean()
  public updateArticle: boolean

  @ValidateIf((o) => o.requestEmailTemplate !== undefined)
  @IsBoolean()
  public requestEmailTemplate: boolean

  @ValidateIf((o) => o.requestEmailTemplate == true)
  @ValidateIf((o) => !o._id)
  @IsDefined()
  public defectEmailTemplate: EmailTemplate

  @ValidateIf((o) => o.requestShipmentMethod !== undefined)
  @IsBoolean()
  public requestShipmentMethod: boolean

  public defectShipmentMethod: ShipmentMethod

  public application: Application

  @ValidateIf((o) => o.level !== undefined)
  @IsNumber()
  public level: number

  @ValidateIf((o) => o.groupsArticles !== undefined)
  @IsBoolean()
  public groupsArticles: boolean

  @ValidateIf((o) => o.printOrigin !== undefined)
  @IsBoolean()
  public printOrigin: boolean

  @ValidateIf((o) => o.paymentMthods !== undefined)
  @IsArray()
  public paymentMthods: PaymentMethod[]

  @Match('currentAccount', {
    message:
      'Cuenta Corriente no puede tener valor "Cobra", cuando se asigna una empresa por defecto',
  })
  public company: Company

  public orderNumber: number
  public resetOrderNumber: string
  public allowAccounting: boolean
  public finishState: string
  public allowPriceList: boolean
  public optionalAFIP: {
    id: string
    name: string
    value: string
  }
  public cashBoxType: CashBoxType
}
