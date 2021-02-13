import { Model } from '../model/model.model';
import { IAttribute } from 'app/util/attribute.interface';
import { AccountPeriod } from '../account-period/account-period';
import { Transaction } from '../transaction/transaction';
import { Account } from '../account/account';

export class AccountSeat extends Model {

    public _id: string;
    public transaction: Transaction;
    public period: AccountPeriod;
    public date: Date;
    public observation: string;
    public items: [{
        account: Account,
        debit: Number,
        credit: Number
    }]

    constructor() { super(); }

    static getAttributes(): IAttribute[] {
        return Model.getAttributes([
            {
                name: 'date',
                visible: true,
                disabled: false,
                filter: true,
                datatype: 'string',
                project: `{ "$dateToString": { "date": "$date", "format": "%d/%m/%Y", "timezone": "-03:00" } }`,
                align: 'center',
                required: true,
            }, {
                name: 'observation',
                visible: true,
                filter: true,
                datatype: 'string',
                align: 'left',
            }, {
                name: 'perdiod.startDate',
                visible: true,
                filter: true,
                project: `{ "$dateToString": { "date": "$date", "format": "%d/%m/%Y", "timezone": "-03:00" } }`,
                datatype: 'string',
                align: 'center',
            }, {
                name: 'perdiod.endDate',
                visible: true,
                filter: true,
                project: `{ "$dateToString": { "date": "$date", "format": "%d/%m/%Y", "timezone": "-03:00" } }`,
                datatype: 'string',
                align: 'center',
            }, {
                name: 'transaction.type.name',
                visible: true,
                filter: true,
                datatype: 'string',
                align: 'left',
            }, {
                name: 'transaction.origin',
                visible: true,
                filter: true,
                datatype: 'string',
                align: 'left',
            }, {
                name: 'transaction.letter',
                visible: true,
                filter: true,
                datatype: 'string',
                align: 'left',
            }, {
                name: 'transaction.number',
                visible: true,
                filter: true,
                datatype: 'string',
                align: 'left',
            }
        ])
    }
}

