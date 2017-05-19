import { Room } from './room';
import { Waiter } from './waiter';

export class Table {
	
	public _id: string;
	public description: string;
	public room: Room = null;
	public chair: number = 1;
	public status: any = TableStatus.Available;
	public waiter: Waiter = null;

	constructor () {}
}

export enum TableStatus {
	Available = <any> "Disponible",
	Busy = <any> "Ocupada",
	Reserved = <any> "Reservada",
	Disabled = <any> "No Habilitada"
}