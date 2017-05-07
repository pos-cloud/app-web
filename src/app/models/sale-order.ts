import { Waiter } from './waiter';
import { Table } from './table';

export class SaleOrder {
	
	public _id: string;
	public code: number = 0;
	public date: Date = new Date();
	public status: any = SaleOrderStatus.Open;
	public observation: string;
	public totalPrice: number = 0.00;
	public waiter: Waiter;
	public table: Table;

	constructor () {}
}

export enum SaleOrderStatus {
	Open = <any> "Abierto",
	Pending = <any> "Pendiente",
	Canceled = <any> "Anulado",
	Closed = <any> "Cerrado"
}