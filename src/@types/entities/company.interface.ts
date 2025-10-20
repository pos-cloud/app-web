import {
  Account,
  Activity,
  Article,
  CompanyGroup,
  Country,
  Employee,
  IdentificationType,
  PaymentMethod,
  PriceList,
  State,
  Transport,
  VATCondition,
} from '@types';

export interface Company extends Activity {
  _id: string;
  code: number;
  name: string;
  fantasyName: string;
  entryDate: string;
  type: CompanyType;
  identificationType: IdentificationType;
  identificationValue: string;
  vatCondition: VATCondition;
  grossIncome: string;
  address: string;
  city: string;
  phones: string;
  emails: string;
  gender: GenderType;
  birthday: string;
  observation: string;
  allowCurrentAccount: boolean;
  group: CompanyGroup;
  employee: Employee;
  country: Country;
  floorNumber: string;
  flat: string;
  state: State;
  transport: Transport;
  priceList: PriceList;
  addressNumber: string;
  wooId: string;
  meliId: string;
  discount: number;
  account: Account;
  creditLimit: number;
  zipCode: string;
  subscription: {
    article: Article;
    paymentMethod: PaymentMethod;
    active: boolean;
  };
}

export enum CompanyType {
  None = <any>null,
  Client = <any>'Cliente',
  Provider = <any>'Proveedor',
}

export enum GenderType {
  None = <any>null,
  Male = <any>'Hombre',
  Female = <any>'Mujer',
}
