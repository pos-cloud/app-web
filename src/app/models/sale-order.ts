import { Company } from './company';
import { CashBox } from './cash-box';
import { Table } from './table';
import { Waiter } from './waiter';
import { Turn } from './turn';

export class SaleOrder {
	
	public _id: string;
	public origin: number = 0;
	public number: number = 0;
	public date: Date = new Date();
	public state: SaleOrderState = SaleOrderState.Open;
	public observation: string;
	public subtotalPrice: number = 0.00;
	public discount: number = 0.00;
	public cashChange: number = 0.00;
	public totalPrice: number = 0.00;
	public company: Company;
	public cashBox: CashBox;
	public table: Table;
	public waiter: Waiter;
	public turn: Turn;

	constructor () {}
}

export enum SaleOrderState {
	Open = <any> "Abierto",
	Canceled = <any> "Anulado",
	Closed = <any> "Cerrado",
	Pending = <any> "Pendiente"
}