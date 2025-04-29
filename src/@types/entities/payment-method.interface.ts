import { Account, Activity, Application, Article, CompanyType, Currency } from '@types';

export interface PaymentMethod extends Activity {
  _id: string;
  order: number; // default: 1
  code: number; // default: 1
  name: string; // default: ''
  discount: number; // default: 0.0
  discountArticle: Article;
  surcharge: number; // default: 0.0
  surchargeArticle: Article;
  commission: number; // default: 0.0
  commissionArticle: Article;
  administrativeExpense: number; // default: 0.0
  administrativeExpenseArticle: Article;
  otherExpense: number; // default: 0.0
  otherExpenseArticle: Article;
  isCurrentAccount: boolean;
  expirationDays: number; // default: 30
  acceptReturned: boolean;
  inputAndOuput: boolean;
  checkDetail: boolean;
  checkPerson: boolean;
  cardDetail: boolean;
  allowToFinance: boolean;
  payFirstQuota: boolean;
  cashBoxImpact: boolean;
  bankReconciliation: boolean;
  company: CompanyType;
  currency: Currency;
  allowCurrencyValue: boolean;
  allowBank: boolean;
  mercadopagoAPIKey: string;
  mercadopagoClientId: string;
  mercadopagoAccessToken: string;
  whatsappNumber: string;
  observation: string;
  applications: Application[];
  account: Account;
}
