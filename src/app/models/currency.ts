import { User } from './user';

import * as moment from 'moment';
import 'moment/locale/es';

export class Currency {
	
	public _id: string;
	public code: string = '1';
	public sign: string = '$';
    public name: string = '';
    public quotation: number = 1;
	public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	public updateUser: User;
	public updateDate: string;

	constructor () {}
}