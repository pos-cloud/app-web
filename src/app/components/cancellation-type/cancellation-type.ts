import { TransactionType } from "../transaction-type/transaction-type";
import { User } from '../user/user';

import * as moment from 'moment';
import { TransactionState } from '../transaction/transaction';

export class CancellationType {

    public _id: string;
    public origin: TransactionType;
    public destination: TransactionType;
    public modifyBalance: boolean = true;
    public requestAutomatic: boolean = false;
    public requestCompany : boolean = true;
    public stateOrigin: TransactionState;
    public creationUser: User;
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public updateUser: User;
    public updateDate: string;

    constructor() { }
}