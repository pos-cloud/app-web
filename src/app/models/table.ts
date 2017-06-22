import { Room } from './room';
import { Employee } from './employee';

export class Table {
	
	public _id: string;
	public description: string;
	public room: Room = null;
	public chair: number = 1;
	public state: TableState = TableState.Available;
	public employee: Employee = null;

	constructor () {}
}

export enum TableState {
	Available = <any> "Disponible",
	Busy = <any> "Ocupada",
	Reserved = <any> "Reservada",
	Pending = <any> "Pendiente",
	Disabled = <any> "No Habilitada"
}