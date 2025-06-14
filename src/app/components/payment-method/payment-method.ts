import { User } from '../user/user';

import { Account, Currency } from '@types';
import * as moment from 'moment';
import { Application } from '../application/application.model';
import { Article } from '../article/article';

export class PaymentMethod {
  public _id: string;
  public order: number = 1;
  public code: number = 1;
  public name: string = '';
  public discount: number = 0.0;
  public discountArticle: Article;
  public surcharge: number = 0.0;
  public surchargeArticle: Article;
  public commission: number = 0.0;
  public commissionArticle: Article;
  public administrativeExpense: number = 0.0;
  public administrativeExpenseArticle: Article;
  public otherExpense: number = 0.0;
  public otherExpenseArticle: Article;
  public isCurrentAccount: boolean;
  public expirationDays: number = 30;
  public acceptReturned: boolean;
  public inputAndOuput: boolean;
  public checkDetail: boolean;
  public checkPerson: boolean;
  public cardDetail: boolean;
  public allowToFinance: boolean;
  public payFirstQuota: boolean;
  public cashBoxImpact: boolean;
  public bankReconciliation: boolean;
  public company: CompanyType;
  public currency: Currency;
  public allowCurrencyValue: boolean;
  public allowBank: boolean;
  public mercadopagoAPIKey: string;
  public mercadopagoClientId: string;
  public mercadopagoAccessToken: string;
  public whatsappNumber: string;
  public observation: string;
  public applications: Application[];
  public account: Account;
  public creationUser: User;
  public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  public updateUser: User;
  public updateDate: string;

  constructor() {}
}

export enum CompanyType {
  None = <any>null,
  Client = <any>'Cliente',
  Provider = <any>'Proveedor',
}
