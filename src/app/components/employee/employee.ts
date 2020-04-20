import { EmployeeType } from 'app/components/employee-type/employee-type';

export class Employee {
	
	public _id: string;
	public code: number;
	public name: string;
	public type: EmployeeType;

	constructor () {}
}