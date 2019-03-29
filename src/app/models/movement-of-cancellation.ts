import * as moment from 'moment';
import 'moment/locale/es';
import { User } from './user';

export class MovementOfCancellation {

    public _id: string;
    public transactionOrigin: string;
    public transactionDestination: string;
	public creationUser: User;
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public updateUser: User;
    public updateDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    constructor() { }
}

