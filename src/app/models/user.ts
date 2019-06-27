import { Employee } from './employee';
import { Company } from './company';
import { Branch } from './branch';

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
	public branch: Branch = null;

	constructor () {}
}

export enum UserState {
	Enabled = <any> "Habilitado",
	Disabled = <any> "No Habilitado",
}
