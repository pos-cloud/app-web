import { Waiter } from './waiter';

export class Table {
	
	public _id: string;
	private code: number = 0;
	private room: string;
	private description: string;
	private chair: number = 1;
	private status: any = TableStatus.Enabled;
	private Waiter: Waiter = null;

	constructor () {}

	public setCode(code: number): void {
        this.code = code;
    }
}

export enum TableStatus {
	Enabled = <any> "Habilitada",
	Disabled = <any> "No Habilitada",
	Wait = <any> "En espera",
	Alert = <any> "Alerta",
	Busy = <any> "Ocupada",
	Closed = <any> "Cerrada"
}