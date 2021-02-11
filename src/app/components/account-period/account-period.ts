import { Model } from '../model/model.model';
import { IAttribute } from 'app/util/attribute.interface';

export class AccountPeriod extends Model {

    public _id: string;
    public status: StatusPeriod;
    public startDate: string;
    public endDate: Account;

    constructor() { super(); }

    static getAttributes(): IAttribute[] {
        return Model.getAttributes([
            {
                name: 'status',
                visible: true,
                filter: true,
                datatype: 'string',
                align: 'left',
            }, {
                name: 'startDate',
                visible: true,
                filter: true,
                datatype: 'string',
                align: 'left',
            }, {
                name: 'endDate',
                visible: true,
                filter: true,
                datatype: 'string',
                align: 'left',
            }
        ])
    }
}

export enum StatusPeriod {
    Open = <any>"Abierto",
    Close = <any>"Cerrado"
}

