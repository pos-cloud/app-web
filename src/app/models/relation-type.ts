import { User } from './user';

import * as moment from 'moment';
import 'moment/locale/es';

export class RelationType {

  public _id: string;
  public code: string = '1';
	public description: string = '';
	public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	public updateUser: User;
	public updateDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');

	constructor () {}
}
