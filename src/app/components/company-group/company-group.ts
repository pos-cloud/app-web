import { User } from '../user/user';

import * as moment from 'moment';

export class CompanyGroup {
	
	public _id: string;
	public description: string = '';
	public creationUser: User;
	public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	public updateUser: User;
	public updateDate: string;
  

	constructor () {}
}