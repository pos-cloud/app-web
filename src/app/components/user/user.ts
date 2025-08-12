import { Branch, Company, Employee, Permission, Printer } from '@types';
import { CashBoxType } from '../cash-box-type/cash-box-type.model';
import { Origin } from '../origin/origin';

export class User {
  public _id: string;
  public name: string;
  public phone: string;
  public email: string;
  public password: string;
  public state: UserState;
  public token: string;
  public tokenExpiration: number = 9999;
  public employee: Employee = null;
  public cashBoxType: CashBoxType = null;
  public company: Company = null;
  public origin: Origin = null;
  public branch: Branch;
  public shortcuts: [
    {
      name: string;
      url: string;
    }
  ];
  public permission: Permission;
  public printers: [
    {
      _id: string;
      printer: Printer;
    }
  ];
  public level: number = 99;

  constructor() {}
}

export enum UserState {
  Enabled = <any>'Habilitado',
  Disabled = <any>'No Habilitado',
}
