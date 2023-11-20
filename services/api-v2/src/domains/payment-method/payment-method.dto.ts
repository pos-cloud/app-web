import {
  IsDefined,
  IsString,
  IsNumber,
  ValidateIf,
  IsBoolean,
  IsArray,
} from 'class-validator'
import Currency from 'domains/currency/currency.interface'

import Application from './../../domains/application/application.interface'
import Article from './../../domains/article/article.interface'
import ModelDto from './../../domains/model/model.dto'
import Account from './../../domains/account/account.interface'

export default class PaymentMethodDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  public order: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  public code: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public name: string

  @ValidateIf((o) => o.discount !== undefined)
  @IsNumber()
  public discount: number

  @ValidateIf((o) => o.discount > 0)
  @ValidateIf((o) => !o._id)
  @IsDefined()
  discountArticle: Article

  @ValidateIf((o) => o.surcharge !== undefined)
  @IsNumber()
  public surcharge: number

  @ValidateIf((o) => o.surcharge > 0)
  @ValidateIf((o) => !o._id)
  @IsDefined()
  surchargeArticle: Article

  @ValidateIf((o) => o.commission !== undefined)
  @IsNumber()
  public commission: number

  @ValidateIf((o) => o.commission > 0)
  @ValidateIf((o) => !o._id)
  @IsDefined()
  commissionArticle: Article

  @ValidateIf((o) => o.administrativeExpense !== undefined)
  @IsNumber()
  administrativeExpense: number

  @ValidateIf((o) => o.administrativeExpense > 0)
  @ValidateIf((o) => !o._id)
  @IsDefined()
  administrativeExpenseArticle: Article

  @ValidateIf((o) => o.otherExpense !== undefined)
  @IsNumber()
  otherExpense: number

  @ValidateIf((o) => o.otherExpense > 0)
  @ValidateIf((o) => !o._id)
  @IsDefined()
  otherExpenseArticle: Article

  public currency: Currency

  @ValidateIf((o) => o.isCurrentAccount !== undefined)
  @IsBoolean()
  public isCurrentAccount: boolean

  @ValidateIf((o) => o.acceptReturned !== undefined)
  @IsBoolean()
  public acceptReturned: boolean

  @ValidateIf((o) => o.inputAndOuput !== undefined)
  @IsBoolean()
  public inputAndOuput: boolean

  @ValidateIf((o) => o.checkDetail !== undefined)
  @IsBoolean()
  public checkDetail: boolean

  @ValidateIf((o) => o.checkPerson !== undefined)
  @IsBoolean()
  public checkPerson: boolean

  @ValidateIf((o) => o.cardDetail !== undefined)
  @IsBoolean()
  public cardDetail: boolean

  @ValidateIf((o) => o.allowToFinance !== undefined)
  @IsBoolean()
  public allowToFinance: boolean

  @ValidateIf((o) => o.payFirstQuota !== undefined)
  @IsBoolean()
  public payFirstQuota: boolean

  @ValidateIf((o) => o.cashBoxImpact !== undefined)
  @IsBoolean()
  public cashBoxImpact: boolean

  @ValidateIf((o) => o.company !== undefined)
  @IsString()
  public company: string

  @ValidateIf((o) => o.bankReconciliation !== undefined)
  @IsBoolean()
  public bankReconciliation: boolean

  @ValidateIf((o) => o.allowCurrencyValue !== undefined)
  @IsBoolean()
  public allowCurrencyValue: boolean

  @ValidateIf((o) => o.allowBank !== undefined)
  @IsBoolean()
  public allowBank: boolean

  @ValidateIf((o) => o.observation !== undefined)
  @IsString()
  public observation: string

  @ValidateIf((o) => o.mercadopagoAPIKey !== undefined)
  @IsString()
  public mercadopagoAPIKey: string

  @ValidateIf((o) => o.mercadopagoClientId !== undefined)
  @IsString()
  public mercadopagoClientId: string

  @ValidateIf((o) => o.whatsappNumber !== undefined)
  @IsString()
  public whatsappNumber: string

  @ValidateIf((o) => o.applications !== undefined)
  @IsArray()
  public applications: Application[]

  public account: Account

  public mercadopagoAccessToken: string

  public expirationDays: number
}
