import { Waiter } from './waiter';

export class CashBox {
	
    private code: number = 1;
    private openingDate: Date = new Date();
    private closingDate: Date;
    private openingCash: number = 0.00;
    private closingCash: number = 0.00;
    private invoicedCash: number = 0.00;
    private difference: number = 0.00;
    private status: any = CashBoxStatus.Open;
    private waiter: Waiter = null;

	constructor () {}
}

export enum CashBoxStatus {
	Open = <any> "Abierta",
	Closed = <any> "Cerrada",
}