import { User } from './user';

import * as moment from 'moment';
import 'moment/locale/es';

export class PaymentMethod {

  public _id: string;
  public code: number = 1;
	public name: string = '';
	public discount: number = 0.00;
	public surcharge: number = 0.00;
	public isCurrentAccount: boolean;
	public acceptReturned: boolean;
	public inputAndOuput: boolean;
	public checkDetail: boolean;
  public cardDetail: boolean;
  public allowToFinance: boolean;
	public cashBoxImpact: boolean;
	public creationUser: User;
  public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  public updateUser: User;
  public updateDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');

	constructor () {}
}
