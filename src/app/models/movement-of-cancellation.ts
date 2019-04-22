import * as moment from 'moment';
import 'moment/locale/es';
import { User } from './user';
import { Transaction } from './transaction';

export class MovementOfCancellation {

    public _id: string;
    public transactionOrigin: Transaction;
    public transactionDestination: Transaction;
    public balance: number = 0;
	public creationUser: User;
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public updateUser: User;
    public updateDate: string;
    constructor() { }
}

