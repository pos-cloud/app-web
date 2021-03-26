import { VATCondition } from '../vat-condition/vat-condition';
import { CompanyGroup } from '../company-group/company-group';
import { User } from '../user/user';
import { IdentificationType } from '../identification-type/identification-type';
import { Country } from '../country/country';
import { State } from '../state/state';
import { CompanyFields } from './company-fields';

import * as moment from 'moment';
import { Transport } from '../transport/transport';
import { PriceList } from '../price-list/price-list';
import { Employee } from '../employee/employee';
import { Account } from '../account/account';

export class Company {

  public _id: string;
  public code: number = 1;
  public name: string;
  public fantasyName: string;
  public entryDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  public type: CompanyType = CompanyType.Client;
  public identificationType: IdentificationType;
  public identificationValue: string;
  public vatCondition: VATCondition;
  public grossIncome: string;
  public address: string;
  public city: string;
  public phones: string;
  public emails: string;
  public gender: GenderType;
  public birthday: string;
  public observation: string;
  public allowCurrentAccount: boolean;
  public group: CompanyGroup;
  public employee: Employee;
  public otherFields: CompanyFields[];
  public country: Country;
  public floorNumber: string;
  public flat: string;
  public state: State;
  public transport: Transport;
  public priceList: PriceList;
  public addressNumber: string;
  public wooId: string;
  public discount: number;
  public account: Account;
  public creationUser: User;
  public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  public updateUser: User;
  public updateDate: string;

  constructor() { }
}

export enum CompanyType {
  None = <any>null,
  Client = <any>"Cliente",
  Provider = <any>"Proveedor",
}

export enum GenderType {
  None = <any>null,
  Male = <any>"Hombre",
  Female = <any>"Mujer"
}

export let attributes = [
  {
    name: 'name',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'fantasyName',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'vatCondition.description',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'identificationType.name',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'identificationValue',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'address',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'addressNumber',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'city',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'state.name',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'phones',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'emails',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'birthday',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'date',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'gender',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'allowCurrentAccount',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'priceList.name',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'employee.name',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'employee._id',
    visible: false,
    disabled: true,
    filter: false,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'observation',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'discount',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'number',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'creationDate',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'date',
    project: null,
    align: 'left',
    required: false,
  },

  {
    name: 'transport.name',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'group.description',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'grossIncome',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'wooId',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'companyType',
    visible: false,
    disabled: true,
    filter: false,
    datatype: 'string',
    project: `"$type"`,
    align: 'left',
    required: true,
  },
  {
    name: 'operationType',
    visible: false,
    disabled: true,
    filter: false,
    datatype: 'string',
    defaultFilter: `{ "$ne": "D" }`,
    project: null,
    align: 'left',
    required: true,
  },
];
