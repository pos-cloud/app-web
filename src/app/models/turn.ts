import { Employee } from './employee';

import * as moment from 'moment';
import 'moment/locale/es';

export class Turn {
	
	public _id: string;
	public startDate: string = moment().format('DD/MM/YYYY HH:mm:ss');
	public endDate: string;
	public state: TurnState = TurnState.Open;
	public employee: Employee = null;

	constructor () {}
}

export enum TurnState {
	Open = <any> "Abierto",
	Closed = <any> "Cerrado"
}