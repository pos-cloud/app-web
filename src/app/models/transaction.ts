import { Company } from './company';
import { CashBox } from './cash-box';
import { Table } from './table';
import { Employee } from './employee';
import { Turn } from './turn';
import { PaymentMethod } from './payment-method';
import { TransactionType } from './transaction-type';

import * as moment from 'moment';
import 'moment/locale/pt-br';

export class Transaction {
	
	public _id: string;
	public origin: number = 0;
	public number: number = 0;
	public date: string;
	public startDate: string = moment().locale('es').format('L') + " " + moment().locale('es').format('LT');
	public endDate: string;
	public state: TransactionState = TransactionState.Open;
	public subtotalPrice: number = 0.00;
	public discount: number = 0.00;
	public totalPrice: number = 0.00;
	public diners: number = 0;
	public observation: string;
	public madein: string;
	public type: TransactionType;
	public company: Company;
	public cashBox: CashBox;
	public table: Table;
	public employeeOpening: Employee;
	public employeeClosing: Employee;
	public turnOpening: Turn;
	public turnClosing: Turn;

	constructor () {}
}

export enum TransactionState {
	Open = <any> "Abierto",
	Delivered = <any> "Entregado",
	Sent = <any> "Enviado",
	Canceled = <any> "Anulado",
	Closed = <any> "Cerrado",
	Pending = <any> "Pendiente"
}