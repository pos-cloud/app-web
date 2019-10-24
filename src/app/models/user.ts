import { Employee } from './employee';
import { Company } from './company';
import { Origin } from './origin';
import { Printer } from './printer';

export class User {

	public _id: string;
	public name: string;
	public email: string;
	public password: string;
	public state: UserState;
	public token: string;
  	public tokenExpiration: number = 9999;
	public employee: Employee = null;
	public company: Company = null;
	public origin: Origin = null;
	public shortcuts: [{
		name: string,
		url: string
	}];
	public printers : [{
		printer : Printer
	}]

	constructor () {}
}

export enum UserState {
	Enabled = <any> "Habilitado",
	Disabled = <any> "No Habilitado",
}
