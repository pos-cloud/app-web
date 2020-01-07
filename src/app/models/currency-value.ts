import { User } from './user';

import * as moment from 'moment';
import 'moment/locale/es';

export class CurrencyValue {
	
	public _id: string;
	public name: string;
	public value: number = 0;
	public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	public updateUser: User;
	public updateDate: string;

	constructor () {}
}