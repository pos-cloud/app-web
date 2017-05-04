import { Waiter } from './waiter';

export class Table {
	
	public _id: string;
	public code: number = 0;
	public room: string;
	public description: string;
	public chair: number = 1;
	public status: any = TableStatus.Enabled;
	public Waiter: Waiter = null;

	constructor () {}
}

export enum TableStatus {
	Enabled = <any> "Habilitada",
	Disabled = <any> "No Habilitada",
	Wait = <any> "En espera",
	Alert = <any> "Alerta",
	Busy = <any> "Ocupada",
	Closed = <any> "Cerrada"
}