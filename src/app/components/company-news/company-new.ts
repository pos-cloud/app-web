import { IAttribute } from 'app/util/attribute.interface';
import { Company } from '../company/company';
import { Model } from '../model/model.model';
import { User } from '../user/user';

export class CompanyNew extends Model {

    public date: string;
    public news: string;
    public state: string;
    public company: Company;

    constructor() { super(); }

    static getAttributes(): IAttribute[] {
        return Model.getAttributes([
            {
                name: 'company.type',
                visible: true,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'center',
                required: false,
            },
            {
                name: 'company.name',
                visible: true,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'center',
                required: false,
            },
            {
                name: 'date',
                visible: true,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: `{ "$dateToString": { "date": "$date", "format": "%d/%m/%Y", "timezone": "-03:00" } }`,
                align: 'center',
                required: false,
            },
            {
                name: 'news',
                visible: true,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            },
        ])
    }
}
