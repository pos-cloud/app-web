import { Employee } from './employee';

export class User {
	
	public _id: string;
	public name: string;
	public password: string;
	public state: UserState = UserState.Enabled;
	public token: String;
	public tokenExpiration: String = "5";
	public employee: Employee = null;

	constructor () {}
}

export enum UserState {
	Enabled = <any> "Habilitado",
	Disabled = <any> "No Habilitado",
}