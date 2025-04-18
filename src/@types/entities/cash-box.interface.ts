import { Activity, CashBoxType, Employee } from '@types';

export interface CashBox extends Activity {
  _id: string;
  number: number;
  openingDate: string;
  closingDate: string;
  state: CashBoxState;
  employee: Employee;
  type: CashBoxType;
}

export enum CashBoxState {
  Open = 'Abierta',
  Closed = 'Cerrada',
}
