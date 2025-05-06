import { Account, Activity, Currency, IdentificationType, VATCondition } from '@types';

export interface Config extends Activity {
  numberCompany: string;
  license: string;
  licenseType: string;
  expirationLicenseDate: string;
  licensePaymentDueDate: string;
  licenseCost: number;
  balance: number;
  apiHost: string;
  apiPort: number;
  emailAccount: string;
  emailPassword: string;
  emailHost: string;
  emailPort: number;
  companyPicture: string;
  companyName: string;
  companyFantasyName: string;
  companyCUIT: string;
  companyIdentificationType: IdentificationType;
  companyIdentificationValue: string;
  companyVatCondition: VATCondition;
  companyStartOfActivity: string;
  companyGrossIncome: string;
  companyAddress: string;
  companyPhone: string;
  companyPostalCode: string;
  modules: JSON;
  footerInvoice: string;
  showLicenseNotification: boolean;
  latitude: string;
  longitude: string;
  country: string;
  timezone: string;
  currency: Currency;
  article: {
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
  company: {
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
  cashBox: {
    perUser: boolean;
  };
  reports: {
    summaryOfAccounts: {
      detailsPaymentMethod: boolean;
      invertedViewClient: boolean;
      invertedViewProvider: boolean;
    };
  };
  tradeBalance: {
    codePrefix: number;
    numberOfCode: number;
    numberOfQuantity: number;
    numberOfIntegers: number;
    numberOfDecimals: number;
  };
  voucher: {
    readingLimit: number;
    minutesOfExpiration: number;
  };
  twilio: {
    accountSid: string;
    authToken: string;
  };
  tiendaNube: {
    token: string;
    userID: string;
    appID: string;
    clientSecret: string;
  };
  ecommerceCost: number;
  ecommercePlan: {
    name: string;
    cost: number;
    pergentaje: number;
  };
}
