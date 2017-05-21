import { Waiter } from './waiter';

export class Turn {
	
	public _id: string;
	public startDate: Date = new Date();
	public endDate: Date;
	public state: any = TurnState.Open;
	public waiter: Waiter = null;

	constructor () {}
}

export enum TurnState {
	Open = <any> "Abierto",
	Closed = <any> "Cerrado"
}