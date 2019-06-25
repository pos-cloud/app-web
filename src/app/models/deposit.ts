import { Branch } from './branch';

export class Deposit {
	
	public _id: string;
    public name: string = '';
    public branch: Branch;
    public capacity: number;
    
	constructor () {}
}