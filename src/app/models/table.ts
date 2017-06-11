import { Room } from './room';
import { Waiter } from './waiter';

export class Table {
	
	public _id: string;
	public description: string;
	public room: Room = null;
	public chair: number = 1;
	public state: any = TableState.Available;
	public waiter: Waiter = null;

	constructor () {}
}

export enum TableState {
	Available = <any> "Disponible",
	Busy = <any> "Ocupada",
	Reserved = <any> "Reservada",
	Pending = <any> "Pendiente",
	Disabled = <any> "No Habilitada"
}