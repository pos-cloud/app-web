import { EmployeeType } from '../employee-type/employee-type.model';

export class Employee {

	public _id: string = '';
	public code: number;
	public name: string;
	public type: EmployeeType;

	constructor () {}
}
