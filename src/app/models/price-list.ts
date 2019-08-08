import { User } from './user';

import * as moment from 'moment';
import 'moment/locale/es';

export class PriceList {

	public _id: string;
	public code: number;
	public name: string = '';
	public percentage: number = 0.00;
	public allowSpecialRules: boolean = false;
	public creationUser: User;
	public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	public updateUser: User;
  	public updateDate: string;

	constructor () {}
}
