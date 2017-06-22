import { Employee } from './employee';

export class User {
	
	public _id: string;
	public name: string;
	public password: string;
	public type: UserTypes = UserTypes.Supervisor;
	public state: UserState = UserState.Enabled;
	public employee: Employee = null;

	constructor () {}
}

export enum UserTypes {
	Supervisor = <any> "Supervisor",
	Employee = <any> "Empleado",
}

export enum UserState {
	Enabled = <any> "Habilitado",
	Disabled = <any> "No Habilitado",
}