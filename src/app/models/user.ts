import { Waiter } from './waiter';

export class User {
	
	public _id: string;
	public name: string;
	public password: string;
	public type: any = UserTypes.Supervisor;
	public state: any = UserState.Enabled;
	public waiter: Waiter = null;

	constructor () {}
}

export enum UserTypes {
	Supervisor = <any> "Supervisor",
	Waiter = <any> "Mozo",
}

export enum UserState {
	Enabled = <any> "Habilitado",
	Disabled = <any> "No Habilitado",
}