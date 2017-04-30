import { Waiter } from './waiter';

export class CashBox {
	
    private code: number = 0;
    private openingDate: Date = new Date();
    private closingDate: Date;
    private openingCash: number = 0.00;
    private closingCash: number = 0.00;
    private invoicedCash: number = 0.00;
    private difference: number = 0.00;
    private status: any = CashBoxStatus.Open;
    private Waiter: Waiter = null;

	constructor () {}
    
    public setCode(code: number): void {
        this.code = code;
    }
}

export enum CashBoxStatus {
	Open = <any> "Abierta",
	Closed = <any> "Cerrada",
}