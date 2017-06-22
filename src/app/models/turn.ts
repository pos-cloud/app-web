import { Employee } from './employee';

export class Turn {
	
	public _id: string;
	public startDate: Date = new Date();
	public endDate: Date;
	public state: TurnState = TurnState.Open;
	public employee: Employee = null;

	constructor () {}
}

export enum TurnState {
	Open = <any> "Abierto",
	Closed = <any> "Cerrado"
}