import { Waiter } from './waiter';

export class CashBox {
    
    public _id: string;
    public code: number = 1;
    public openingDate: Date = new Date();
    public closingDate: Date;
    public openingCash: number = 0.00;
    public closingCash: number = 0.00;
    public invoicedCash: number = 0.00;
    public difference: number = 0.00;
    public state: CashBoxState = CashBoxState.Open;
    public waiter: Waiter = null;

	constructor () {}
}

export enum CashBoxState {
	Open = <any> "Abierta",
	Closed = <any> "Cerrada",
}