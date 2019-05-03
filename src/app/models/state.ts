import { User } from './user';
import { Country } from './country';

import * as moment from 'moment';
import 'moment/locale/es';

export class State {

    public _id: string;
    public code: string;
    public name: string;
    public country : Country;
    public creationUser: User;
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public updateUser: User;
    public updateDate: string;
  
    constructor() { }
}