import { Room } from './room';
import { Employee } from './employee';
import { Transaction } from './transaction';

export class Table {
	
	public _id: string;
	public description: string;
	public room: Room = null;
	public chair: number = 2;
	public diners: number;
	public state: TableState = TableState.Available;
	public employee: Employee = null;
	public lastTransaction: Transaction;

	constructor () {}
}

export enum TableState {
	Available = <any> "Disponible",
	Busy = <any> "Ocupada",
	Reserved = <any> "Reservada",
	Pending = <any> "Pendiente",
	Disabled = <any> "No Habilitada"
}