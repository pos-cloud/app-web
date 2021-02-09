import { User } from '../user/user';

import * as moment from 'moment';
import { Account } from '../account/account';

export class Bank {

    public _id: string;
    public code: number;
    public agency: number;
    public account : Account;
    public name : string;
    public creationUser: User;
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public updateUser: User;
    public updateDate: string;
  
    constructor() { }
}