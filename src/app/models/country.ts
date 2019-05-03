import { User } from './user';

import * as moment from 'moment';
import 'moment/locale/es';

export class Country {

    public _id: string;
    public code: string;
    public name: string;
    public callingCodes : string ;
    public timezones : string ;
    public flag : string;
    public alpha2Code : string ;
    public alpha3Code : string; 
    public creationUser: User;
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public updateUser: User;
    public updateDate: string;
  
    constructor() { }
}

