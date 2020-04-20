
import * as moment from 'moment';
import { CashBoxType } from '../cash-box-type/cash-box-type';
import { Employee } from 'app/components/employee/employee';

export class CashBox {
    
    public _id: string;
    public number: number;
    public openingDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public closingDate: string;
    public state: CashBoxState = CashBoxState.Open;
    public employee: Employee = null;
    public type: CashBoxType = null;

	constructor () {}
}

export enum CashBoxState {
	Open = <any> "Abierta",
	Closed = <any> "Cerrada",
}