import { Room } from '../room/room';
import { Transaction } from '../transaction/transaction';
import * as moment from 'moment';
import { User } from '../user/user';
import { Employee } from '../employee/employee';

export class Table {

    public _id: string;
    public description: string;
    public room: Room = null;
    public chair: number = 2;
    public diners: number;
    public state: TableState = TableState.Available;
    public employee: Employee = null;
    public lastTransaction: Transaction;

    public creationUser: User;
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public updateUser: User;
    public updateDate: string;

    constructor() { }
}

export enum TableState {
    Available = <any>"Disponible",
    Busy = <any>"Ocupada",
    Reserved = <any>"Reservada",
    Pending = <any>"Pendiente",
    Disabled = <any>"No Habilitada"
}