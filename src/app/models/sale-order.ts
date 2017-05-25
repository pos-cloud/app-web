import { Company } from './company';
import { CashBox } from './cash-box';
import { Waiter } from './waiter';
import { Table } from './table';

export class SaleOrder {
	
	public _id: string;
	public origin: number = 0;
	public number: number = 0;
	public date: Date = new Date();
	public state: any = SaleOrderState.Open;
	public observation: string;
	public totalPrice: number = 0.00;
	public company: Company;
	public cashBox: CashBox;
	public waiter: Waiter;
	public table: Table;

	constructor () {}
}

export enum SaleOrderState {
	Open = <any> "Abierto",
	Pending = <any> "Pendiente",
	Canceled = <any> "Anulado",
	Closed = <any> "Cerrado"
}