import { VATCondition } from './vat-condition';
import { CompanyGroup } from './company-group';
import { Employee } from "./employee";
import { User } from './user';
import { IdentificationType } from './identification-type';
import { Country } from './country';
import { State } from './state';
import { CompanyFields } from './company-fields';

import * as moment from 'moment';
import 'moment/locale/es';
import { Transport } from './transport';

export class Company {

  public _id: string;
  public code: number = 1;
  public name: string;
  public fantasyName: string;
  public entryDate: string  = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  public type: CompanyType = CompanyType.Client;
  public identificationType: IdentificationType;
  public identificationValue: string;
  public vatCondition: VATCondition;
  public CUIT: string;
  public DNI: string;
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
  public employee : Employee;
  public otherFields: CompanyFields[];
  public country: Country;
  public floorNumber: string;
  public flat: string;
  public state: State;
  public transport: Transport;
  public addressNumber: string;
  public creationUser: User;
  public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  public updateUser: User;
  public updateDate: string;

  constructor() {}
}

export enum CompanyType {
  None = <any> null,
  Client = <any> "Cliente",
  Provider = <any> "Proveedor",
}

export enum GenderType {
  None = <any> null,
  Male = <any> "Hombre",
  Female = <any> "Mujer"
}
