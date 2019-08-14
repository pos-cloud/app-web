import { User } from './user';

import * as moment from 'moment';
import 'moment/locale/es';
import { Category } from './category';
import { Make } from './make';

export class PriceList {

	public _id: string;
	public name: string = '';
	public percentage: number;
	public allowSpecialRules: boolean = false;
	public rules: [{
		_id: string;
		category: Category;
		make : Make;
		percentage: number;
	}];
	public creationUser: User;
	public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	public updateUser: User;
  	public updateDate: string;

	constructor () {}
}
