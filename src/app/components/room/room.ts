
import * as moment from 'moment';
import { User } from '../user/user';

export class Room {

    public _id: string;
    public description: string = '';

    public creationUser: User;
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public updateUser: User;
    public updateDate: string;
    constructor() { }
}