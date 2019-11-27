import { User } from './user';

import * as moment from 'moment';
import 'moment/locale/es';

export class Branch {

    public _id: string;
    public number: number;
    public name : string;
    public default : boolean = false;
    public creationUser: User;
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public updateUser: User;
    public updateDate: string;
  
    constructor() { }
}