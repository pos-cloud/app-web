import Account from './../../domains/account/account.interface'
import Currency from './../../domains/currency/currency.interface'
import IdentificationType from './../../domains/identification-type/identification-type.interface'
import Model from './../../domains/model/model.interface'
import VATCondition from './../../domains/vat-condition/vat-condition.interface'
import {IService} from './service.interface'

export default interface Config extends Model {
  numberCompany: string
  license: string
  expirationLicenseDate: Date
  licensePaymentDueDate: Date
  licenseCost: number
  services: IService[]
  balance: number
  apiHost: string
  apiPort: number
  emailAccount: string
  emailPassword: string
  emailHost: string
  emailPort: number
  companyPicture: string
  companyName: string
  companyFantasyName: string
  companyCUIT: string
  companyIdentificationType: IdentificationType
  companyIdentificationValue: string
  companyVatCondition: VATCondition
  companyStartOfActivity: Date
  companyGrossIncome: string
  companyAddress: string
  companyPhone: string
  companyPostalCode: string
  modules: JSON
  footerInvoice: string
  showLicenseNotification: boolean
  latitude: string
  longitude: string
  country: string
  timezone: string
  currency: Currency
  article: {
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
  company: {
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
  cashBox: {
    perUser: boolean
  }
  reports: {
    summaryOfAccounts: {
      detailsPaymentMethod: boolean
      invertedViewClient: boolean
      invertedViewProvider: boolean
    }
  }
  tradeBalance: {
    codePrefix: number
    numberOfCode: number
    numberOfQuantity: number
    numberOfIntegers: number
    numberOfDecimals: number
  }
  voucher: {
    readingLimit: number
    minutesOfExpiration: number
  }
  twilio: {
    accountSid: string
    authToken: string
  }
  tiendaNube:{
	token: string
	userID: string
	appID: string
	clientSecret: string
  }
  ecommerceCost: number
  ecommercePlan: {
    name: string
    cost: number
    pergentaje: number
  }
}
