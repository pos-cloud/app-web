import { User } from '../user/user';

import * as moment from 'moment';

export class Classification {

    public _id: string;
    public name : string;
    public creationUser: User;
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public updateUser: User;
    public updateDate: string;
  
    constructor() { }
}