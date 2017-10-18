import { PaymentMethod } from './payment-method';
import { Transaction } from './transaction';

import * as moment from 'moment';
import 'moment/locale/pt-br';

export class MovementOfCash {

    public _id: string;
    public date: string = moment().locale('es').format('L')+" "+ moment().locale('es').format('LT');
    public expirationDate: string = moment().locale('es').format('L')+" "+ moment().locale('es').format('LT');
    public state: MovementOfCashState = MovementOfCashState.Pending;
    public amountPaid: number = 0.00;
    public cashChange: number = 0.00;
    public amountCharge: number = 0.00;
    public observation: string;
    public type: PaymentMethod;
    public transaction: Transaction;

    constructor() { }
}

export enum MovementOfCashState {
    Canceled = <any>"Anulado",
    Closed = <any>"Cerrado",
    Pending = <any>"Pendiente"
}