import { Deposit } from '../deposit/deposit';
import { User } from '../user/user';

import * as moment from 'moment';

export class Location {
	
	public _id: string;
    public description: string = '';
    public positionX: string = '';
	public positionY: string = '';
	public positionZ: string = '';
	public deposit : Deposit;
	public operationType: string;
	public creationUser: User;
	public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	public updateUser: User;
	public updateDate: string;
	

	constructor () {}
}