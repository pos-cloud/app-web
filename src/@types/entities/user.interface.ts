import { Activity, Employee } from '@types';

export interface User extends Activity {
  _id: string;
  name: string;
  phone: string;
  email: string;
  password: string;
  state: UserState;
  token: string;
  tokenExpiration: number;
  employee: Employee | null;
  //   cashBoxType: CashBoxType | null;
  //   company: Company | null;
  //   origin: Origin | null;
  //   branch: Branch;
  //   shortcuts: { name: string; url: string }[];
  //   permission: Permission;
  //   printers: { _id: string; printer: Printer }[];
  //   level: number;
}

export enum UserState {
  Enabled = 'Habilitado',
  Disabled = 'No Habilitado',
}
