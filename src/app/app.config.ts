import { Account, Currency, IdentificationType, IService, VATCondition } from '@types';
import * as moment from 'moment';

export class Config {
  public _id: string;
  static modules;
  static emailAccount: string;
  static emailPassword: string;
  static companyPicture: string;
  static companyName: string;
  static companyAddress: string;
  static companyFantasyName: string;
  static companyPhone: string;
  static companyVatCondition: VATCondition;
  static companyIdentificationType: IdentificationType;
  static companyIdentificationValue: string;
  static companyStartOfActivity: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  static companyGrossIncome: string;
  static companyPostalCode: string;
  static footerInvoice: string;
  services: IService[];
  balance: number;
  static country: string;
  static timezone: string;
  static currency: Currency;
  static licenseCost: number;
  public article: {
    code: {
      validators: {
        maxLength: number;
      };
    };
    isWeigth: {
      default: boolean;
    };
    allowSaleWithoutStock: {
      default: boolean;
    };
    salesAccount: {
      default: Account;
    };
    purchaseAccount: {
      default: Account;
    };
  };
  public company: {
    // allowCurrentAccount:{
    //   default: boolean
    // }
    allowCurrentAccountProvider: {
      default: boolean;
    };
    allowCurrentAccountClient: {
      default: boolean;
    };
    vatCondition: {
      default: VATCondition;
    };
    accountClient: {
      default: Account;
    };
    accountProvider: {
      default: Account;
    };
  };
  public cashBox: {
    perUser: boolean;
  };
  public reports: {
    summaryOfAccounts: {
      detailsPaymentMethod: boolean;
      invertedViewClient: boolean;
      invertedViewProvider: boolean;
    };
  };
  public tradeBalance: {
    codePrefix: number;
    numberOfCode: number;
    numberOfQuantity: number;
    numberOfIntegers: number;
    numberOfDecimals: number;
  };
  public voucher: {
    readingLimit: number;
    minutesOfExpiration: number;
  };
  public twilio: {
    senderNumber: string;
    accountSid: string;
    authToken: string;
  };
  public tiendaNube: {
    token: string;
    userID: string;
    // appID: string;
    // clientSecret: string;
  };
  businessModel: any;

  public static setModules(modules): void {
    Config.modules = modules;
  }

  public static setConfigEmail(emailAccount, emailPassword): void {
    Config.emailAccount = emailAccount;
    Config.emailPassword = emailPassword;
  }

  public static setConfigCompany(
    companyPicture,
    companyName,
    companyAddress,
    companyPhone,
    companyVatCondition,
    companyStartOfActivity,
    companyGrossIncome,
    footerInvoice,
    companyFantasyName,
    country,
    timezone,
    currency,
    companyIdentificationType,
    companyIdentificationValue,
    licenseCost,
    companyPostalCode
  ): void {
    Config.companyPicture = companyPicture;
    Config.companyName = companyName;
    Config.companyAddress = companyAddress;
    Config.companyFantasyName = companyFantasyName;
    Config.companyPhone = companyPhone;
    Config.companyVatCondition = companyVatCondition;
    Config.companyStartOfActivity = companyStartOfActivity;
    Config.companyGrossIncome = companyGrossIncome;
    Config.footerInvoice = footerInvoice;
    Config.country = country;
    Config.timezone = timezone;
    Config.companyIdentificationType = companyIdentificationType;
    Config.companyIdentificationValue = companyIdentificationValue;
    Config.licenseCost = licenseCost;
    Config.currency = currency;
    Config.companyPostalCode = companyPostalCode;
  }
}
