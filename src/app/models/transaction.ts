import { Company } from './company';
import { CashBox } from './cash-box';
import { Table } from './table';
import { Employee } from './employee';
import { Turn } from './turn';

export class Transaction {
	
	public _id: string;
	public origin: number = 0;
	public number: number = 0;
	public startDate: Date = new Date();
	public endDate: Date;
	public state: TransactionState = TransactionState.Open;
	public subtotalPrice: number = 0.00;
	public discount: number = 0.00;
	public cashChange: number = 0.00;
	public totalPrice: number = 0.00;
	public type: number = 0.00;
	public company: Company;
	public cashBox: CashBox;
	public table: Table;
	public employee: Employee;
	public turn: Turn;

	constructor () {}
}

export enum TransactionState {
	Open = <any> "Abierto",
	Canceled = <any> "Anulado",
	Closed = <any> "Cerrado",
	Pending = <any> "Pendiente"
}