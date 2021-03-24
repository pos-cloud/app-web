import { Model } from '../model/model.model';
import { IAttribute } from 'app/util/attribute.interface';

export class AccountPeriod extends Model {

    public _id: string;
    public description : string;
    public status: StatusPeriod;
    public startDate: string;
    public endDate: Account;

    constructor() { super(); }

    static getAttributes(): IAttribute[] {
        return Model.getAttributes([
            {
                name: 'description',
                visible: true,
                filter: true,
                datatype: 'string',
                align: 'left',
            },
            {
                name: 'status',
                visible: true,
                filter: true,
                datatype: 'string',
                align: 'left',
            }, {
                name: 'startDate',
                project: `{ "$dateToString": { "date": "$startDate", "format": "%d/%m/%Y", "timezone": "-03:00" } }`,
                visible: true,
                filter: true,
                datatype: 'string',
                align: 'left',
            }, {
                name: 'endDate',
                project: `{ "$dateToString": { "date": "$endDate", "format": "%d/%m/%Y", "timezone": "-03:00" } }`,
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

