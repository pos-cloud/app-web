import { Activity, CashBoxType, Employee, PaymentMethod } from '@types';

export interface CashBoxBalanceItem {
  type: PaymentMethod;
  name: string;
  balance: number;
}

export interface CashBoxSummary {
  total: number;
  totalEntries: number;
  totalOutputs: number;
  totalOpen: number;
  totalClosing: number;
}

export interface CashBox extends Activity {
  _id: string;
  number: number;
  openingDate: string;
  closingDate: string;
  state: CashBoxState;
  employee?: Employee;
  type: CashBoxType;
  open?: CashBoxBalanceItem[];
  entries?: CashBoxBalanceItem[];
  outputs?: CashBoxBalanceItem[];
  closing?: CashBoxBalanceItem[];
  summary?: CashBoxSummary;
}

export enum CashBoxState {
  Open = 'Abierta',
  Closed = 'Cerrada',
}
