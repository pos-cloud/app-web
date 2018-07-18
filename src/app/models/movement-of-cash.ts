import { PaymentMethod } from './payment-method';
import { Transaction } from './transaction';

import * as moment from 'moment';
import 'moment/locale/es';

export class MovementOfCash {

    public _id: string;
    public date: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public expirationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public state: MovementOfCashState = MovementOfCashState.Pending;
    public amountPaid: number = 0.00;
    public cashChange: number = 0.00;
    public discount: number = 0.00;
    public surcharge: number = 0.00;
    public amountCharge: number = 0.00;
    public observation: string;
    public type: PaymentMethod;
    public transaction: Transaction;
    public receiver: string;
    public number: string;
    public bank: string;
    public titular: string;
    public CUIT: string;
    public deliveredBy: string;

    constructor() { }
}

export enum MovementOfCashState {
    Canceled = <any>"Anulado",
    Closed = <any>"Cerrado",
    Pending = <any>"Pendiente",
    InPortafolio = <any>"En Cartera"
}