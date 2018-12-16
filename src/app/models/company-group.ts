import { User } from './user';

import * as moment from 'moment';
import 'moment/locale/es';

export class CompanyGroup {
	
	public _id: string;
	public description: string = '';
	public creationUser: User;
	public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	public updateUser: User;
	public updateDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  

	constructor () {}
}