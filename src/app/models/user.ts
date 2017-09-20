import { Employee } from './employee';

export class User {
	
	public _id: string;
	public name: string;
	public password: string;
	public state: UserState;
	public token: boolean;
	public tokenExpiration: number;
	public employee: Employee = null;

	constructor () {}
}

export enum UserState {
	Enabled = <any> "Habilitado",
	Disabled = <any> "No Habilitado",
}