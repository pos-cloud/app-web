import { Branch } from '../branch/branch';
import { User } from '../user/user';

import * as moment from 'moment';

export class Deposit {
	
	public _id: string;
    public name: string = '';
    public branch: Branch;
    public capacity: number;
    public default : Boolean;
    public operationType : string;
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	public updateUser: User;
    public updateDate: string;
    
	constructor () {}
}