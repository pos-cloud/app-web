import { PaymentMethod } from './payment-method';
import { Transaction } from './transaction';
import { Bank } from './bank';

import * as moment from 'moment';
import 'moment/locale/es';

export class MovementOfCash {

    public _id: string;
    public date: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public quota: number = 1;
    public expirationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public discount: number = 0.00;
    public surcharge: number = 0.00;
    public statusCheck: StatusCheck = null;
    public amountPaid: number = 0.00;
    public observation: string;
    public type: PaymentMethod;
    public transaction: Transaction;
    public receiver: string;
    public number: string;
    public bank: Bank;
    public titular: string;
    public CUIT: string;
    public deliveredBy: string;

    constructor() { }
}

export enum StatusCheck {
    Rejected = <any>"Rechazado",
    Closed = <any>"Cerrado",
    Deposit = <any>"Depositado",
    Available = <any>"Disponible"
}
