import { User } from '../user/user';

import * as moment from 'moment';

export class IdentificationType {

	public _id: string;
	public code: string = '1';
	public name: string = '';
	public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	public updateUser: User;
	public updateDate: string;

	constructor () {}
}
