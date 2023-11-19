import {
  IsDefined,
  IsString,
  ValidateIf,
  IsNumber,
  IsJSON,
  IsBoolean,
} from 'class-validator'
import * as moment from 'moment'
import 'moment/locale/es'

import Account from './../../domains/account/account.interface'
import Currency from './../../domains/currency/currency.interface'
import IdentificationType from './../../domains/identification-type/identification-type.interface'
import ModelDto from './../../domains/model/model.dto'
import VATCondition from './../../domains/vat-condition/vat-condition.interface'
import {IService} from './service.interface'

export default class ConfigDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public numberCompany: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  public license: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  @ValidateIf((o) => moment(o.expirationLicenseDate, 'YYYY-MM-DDTHH:mm:ssZ').isValid())
  public expirationLicenseDate: string

  @ValidateIf((o) => o.licensePaymentDueDate !== undefined)
  @IsString()
  @ValidateIf((o) => moment(o.licensePaymentDueDate, 'YYYY-MM-DDTHH:mm:ssZ').isValid())
  public licensePaymentDueDate: string

  @ValidateIf((o) => o.licenseCost !== undefined)
  @IsNumber()
  public licenseCost: number

  public services: IService[]

  @ValidateIf((o) => o.balance !== undefined)
  @IsNumber()
  public balance: number

  @ValidateIf((o) => o.licenseCost !== undefined)
  @IsString()
  public apiHost: string

  @ValidateIf((o) => o.apiPort !== undefined)
  @IsNumber()
  public apiPort: number

  @ValidateIf((o) => o.licenseCost !== undefined)
  @IsString()
  public emailAccount: string

  @ValidateIf((o) => o.licenseCost !== undefined)
  @IsString()
  public emailPassword: string

  @ValidateIf((o) => o.licenseCost !== undefined)
  @IsString()
  public emailHost: string
  @ValidateIf((o) => o.licenseCost !== undefined)
  @IsString()
  public emailPort: string

  @ValidateIf((o) => o.companyPicture !== undefined)
  @IsString()
  public companyPicture: string

  @ValidateIf((o) => o.companyName !== undefined)
  @IsString()
  public companyName: string

  @ValidateIf((o) => o.companyFantasyName !== undefined)
  @IsString()
  public companyFantasyName: string

  @ValidateIf((o) => o.companyCUIT !== undefined)
  @IsString()
  public companyCUIT: string

  public companyIdentificationType: IdentificationType

  @ValidateIf((o) => o.companyIdentificationValue !== undefined)
  @IsString()
  public companyIdentificationValue: string

  public companyVatCondition: VATCondition

  @ValidateIf((o) => o.companyStartOfActivity !== undefined)
  @IsString()
  @ValidateIf((o) => moment(o.companyStartOfActivity, 'YYYY-MM-DDTHH:mm:ssZ').isValid())
  public companyStartOfActivity: string

  @ValidateIf((o) => o.companyGrossIncome !== undefined)
  @IsString()
  public companyGrossIncome: string

  @ValidateIf((o) => o.companyAddress !== undefined)
  @IsString()
  public companyAddress: string

  @ValidateIf((o) => o.companyPhone !== undefined)
  @IsString()
  public companyPhone: string

  @ValidateIf((o) => o.companyPostalCode !== undefined)
  @IsString()
  public companyPostalCode: string

  @ValidateIf((o) => o.modules !== undefined)
  @IsJSON()
  public modules: JSON

  @ValidateIf((o) => o.footerInvoice !== undefined)
  @IsString()
  public footerInvoice: string

  @ValidateIf((o) => o.showLicenseNotification !== undefined)
  @IsBoolean()
  public showLicenseNotification: boolean

  @ValidateIf((o) => o.latitude !== undefined)
  @IsString()
  public latitude: string

  @ValidateIf((o) => o.longitude !== undefined)
  @IsString()
  public longitude: string

  @ValidateIf((o) => o.country !== undefined)
  @IsString()
  public country: string

  @ValidateIf((o) => o.timezone !== undefined)
  @IsString()
  public timezone: string

  public currency: Currency

  public article: {
    code: {
      validators: {
        maxLength: number
      }
    }
    isWeigth: {
      default: boolean
    }
    allowSaleWithoutStock: {
      default: boolean
    }
    salesAccount: {
      default: Account
    }
    purchaseAccount: {
      default: Account
    }
  }

  public company: {
    // allowCurrentAccount: {
    // 	default: boolean
    // },
    allowCurrentAccountProvider: {
      default: boolean
    }
    allowCurrentAccountClient: {
      default: boolean
    }
    vatCondition: {
      default: VATCondition
    }
    accountClient: {
      default: Account
    }
    accountProvider: {
      default: Account
    }
  }

  public cashBox: {
    perUser: boolean
  }

  public reports: {
    summaryOfAccounts: {
      detailsPaymentMethod: boolean
      invertedViewClient: boolean
      invertedViewProvider: boolean
    }
  }

  public tradeBalance: {
    codePrefix: number
    numberOfCode: number
    numberOfQuantity: number
    numberOfIntegers: number
    numberOfDecimals: number
  }

  public voucher: {
    readingLimit: number
    minutesOfExpiration: number
  }

  public twilio: {
    accountSid: string
    authToken: string
  }
  public tiendaNube: {
	token: string
	userID: string
	appID: string
	clientSecret: string
}

  public ecommerceCost: number
  public ecommercePlan: {
    name: string
    cost: number
    pergentaje: number
  }
}
