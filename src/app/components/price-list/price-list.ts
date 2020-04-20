import { User } from '../user/user';

import * as moment from 'moment';
import { Category } from '../category/category';
import { Make } from '../make/make';
import { Article } from '../article/article';

export class PriceList {

	public _id: string;
	public name: string = '';
	public percentage: number = 0;
    public allowSpecialRules: boolean = false;
    public default: boolean = false;
	public rules: [{
		_id: string;
		category: Category;
		make : Make;
		percentage: number;
	}];
	public exceptions: [{
		_id: string;
		article : Article;
		percentage: number;
	}];
	public creationUser: User;
	public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	public updateUser: User;
  	public updateDate: string;

	constructor () {}
}
