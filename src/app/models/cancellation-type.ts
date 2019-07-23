import { TransactionType } from "./transaction-type";
import { User } from './user';

import * as moment from 'moment';
import 'moment/locale/es';

export class CancellationType {

    public _id: string;
    public origin: TransactionType;
    public destination: TransactionType;
    public modifyBalance: boolean = true;
    public creationUser: User;
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public updateUser: User;
    public updateDate: string;
  
    constructor() { }
}