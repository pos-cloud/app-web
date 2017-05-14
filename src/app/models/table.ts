import { Room } from './room';
import { Waiter } from './waiter';

export class Table {
	
	public _id: string;
	public description: string;
	public room: Room = null;
	public chair: number = 1;
	public status: any = TableStatus.Enabled;
	public waiter: Waiter = null;

	constructor () {}
}

export enum TableStatus {
	Enabled = <any> "Habilitada",
	Disabled = <any> "No Habilitada",
	Reserved = <any> "Reservada",
	Busy = <any> "Ocupada",
	Closed = <any> "Cerrada"
}