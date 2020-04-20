import { User } from '../user/user';

import * as moment from 'moment';
import 'moment/locale/es';

export class Voucher {

    public _id: string;
    public date: string;
    public token: string;
    public readings: number = 0;
    public expirationDate: string;
    public creationUser: User;
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public updateUser: User;
    public updateDate: string;

    constructor() { }
}
