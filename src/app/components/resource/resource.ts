import { User } from '../user/user';

import * as moment from 'moment';
import 'moment/locale/es';

export class Resource {

    public _id: string;
    public name: string;
    public type: string;
    public file: string;
    public creationUser: User;
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public updateUser: User;
    public updateDate: string;

    constructor() { }
}