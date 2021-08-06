import { IAttribute } from 'app/util/attribute.interface';
import { Model } from '../model/model.model';

export class Report extends Model {

    public name: string;
    public query: string;
    public table : string;
    public params : [{
        name : string,
        type : string
    }]

    constructor() { super(); }

    static getAttributes(): IAttribute[] {
        return Model.getAttributes([
            {
                name: 'name',
                visible: true,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'table',
                visible: true,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            }
        ])
    }
}