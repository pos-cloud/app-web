import { Employee } from './employee';

import * as moment from 'moment';
import 'moment/locale/es';

export class CashBox {
    
    public _id: string;
    public openingDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public closingDate: string;
    public state: CashBoxState = CashBoxState.Open;
    public employee: Employee = null;

	constructor () {}
}

export enum CashBoxState {
	Open = <any> "Abierta",
	Closed = <any> "Cerrada",
}