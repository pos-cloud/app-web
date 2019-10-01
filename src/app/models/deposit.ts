import { Branch } from './branch';
import { User } from './user';

import * as moment from 'moment';
import 'moment/locale/es';

export class Deposit {
	
	public _id: string;
    public name: string = '';
    public branch: Branch;
    public capacity: number;
    public default : boolean;
    public operationType : string;
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	public updateUser: User;
    public updateDate: string;
    
	constructor () {}
}