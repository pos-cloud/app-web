import { Deposit } from './deposit';
import { User } from './user';

import * as moment from 'moment';
import 'moment/locale/es';

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