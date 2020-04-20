import { User } from '../user/user';

import * as moment from 'moment';

export class Branch {

    public _id: string;
    public number: number;
    public name: string;
    public default: boolean = false;
    public image: string;
    public creationUser: User;
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public updateUser: User;
    public updateDate: string;

    constructor() { }
}