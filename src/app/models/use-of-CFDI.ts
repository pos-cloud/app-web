import { User } from './user';

import * as moment from 'moment';
import 'moment/locale/es';

export class UseOfCFDI {

  public _id: string;
  public code: string = '';
  public description: string = '';
  public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  public updateUser: User;
  public updateDate: string;

  constructor() { }
}
