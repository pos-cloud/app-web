import { User } from './user';

import * as moment from 'moment';
import 'moment/locale/es';

export class Bank {

    public _id: string;
    public code: number;
    public agency: number;
    public account : string;
    public name : string;
    public creationUser: User;
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public updateUser: User;
    public updateDate: string;
  
    constructor() { }
}