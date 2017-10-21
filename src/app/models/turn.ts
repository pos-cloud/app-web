import { Employee } from './employee';

import * as moment from 'moment';
import 'moment/locale/pt-br';

export class Turn {
	
	public _id: string;
	public startDate: string = moment().locale('es').format('YYYY/MM/DD')+" "+ moment().locale('es').format('LTS');
	public endDate: string;
	public state: TurnState = TurnState.Open;
	public employee: Employee = null;

	constructor () {}
}

export enum TurnState {
	Open = <any> "Abierto",
	Closed = <any> "Cerrado"
}