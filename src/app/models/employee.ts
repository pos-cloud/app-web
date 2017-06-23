import { EmployeeType } from './employee-type';

export class Employee {
	
	public _id: string;
	public code: number = 1;
	public name: string;
	public type: EmployeeType;

	constructor () {}
}