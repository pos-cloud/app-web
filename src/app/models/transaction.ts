import { Company } from './company';
import { CashBox } from './cash-box';
import { Table } from './table';
import { Employee } from './employee';
import { Turn } from './turn';
import { TransactionType } from './transaction-type';
import { Taxes } from './taxes';

import * as moment from 'moment';
import 'moment/locale/es';

export class Transaction {
	
	public _id: string;
	public origin: number = 0;
	public letter: string = "X";
	public number: number = 0;
	public startDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	public endDate: string;
	public expirationDate: string;
	public VATPeriod: string = moment().format('YYYYMM');
	public state: TransactionState = TransactionState.Open;
	public exempt: number = 0.00;
	public taxes: Taxes[];
	public discountAmount: number = 0.00;
	public discountPercent: number = 0.00;
	public totalPrice: number = 0.00;
	public diners: number = 0;
	public observation: string;
	public madein: string;
	public CAE: string;
	public CAEExpirationDate: string;
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