import { User } from '../user/user';
import { Branch } from '../branch/branch';

import * as moment from 'moment';

export class Origin {

    public _id: string;
    public number: number = 0;
    public branch : Branch;
    public creationUser: User;
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public updateUser: User;
    public updateDate: string;
  
    constructor() { }
}