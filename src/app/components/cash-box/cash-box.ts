import { CashBoxBalanceItem, CashBoxSummary, CashBoxType, Employee } from '@types';
import * as moment from 'moment';

export class CashBox {
  public _id: string;
  public number: number;
  public openingDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  public closingDate: string;
  public state: CashBoxState = CashBoxState.Open;
  public employee: Employee = null;
  public type: CashBoxType = null;
  public open?: CashBoxBalanceItem[] = [];
  public entries?: CashBoxBalanceItem[] = [];
  public outputs?: CashBoxBalanceItem[] = [];
  public closing?: CashBoxBalanceItem[] = [];
  public summary?: CashBoxSummary = {
    total: 0,
    totalEntries: 0,
    totalOutputs: 0,
    totalOpen: 0,
    totalClosing: 0,
  };

  constructor() {}
}

export enum CashBoxState {
  Open = <any>'Abierta',
  Closed = <any>'Cerrada',
}
