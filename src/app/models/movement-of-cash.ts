import { PaymentMethod } from './payment-method';
import { Transaction } from './transaction';

export class MovementOfCash {

    public _id: string;
    public date: Date = new Date();
    public expirationDate: Date = new Date();
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