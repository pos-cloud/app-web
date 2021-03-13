import * as moment from 'moment';
import { User } from '../user/user';
import { Application } from '../application/application.model';
import { IAttribute } from 'app/util/attribute.interface';
import { Model } from '../model/model.model';
import { VariantType } from '../variant-type/variant-type';

export class VariantValue extends Model {

    public _id: string;
	public type: VariantType;
	public order: number = 1;
	public description: string = '';

    constructor() { super(); }

    static getAttributes(): IAttribute[] {
        return Model.getAttributes([
            {
                name: 'order',
                visible: true,
                disabled: false,
                filter: true,
                datatype: 'number',
                project: null,
                align: 'center',
                required: false,
            },
            {
                name: 'description',
                visible: true,
                disabled: false,
                filter: true,
                datatype: 'text',
                project: null,
                align: 'center',
                required: false,
            },
            {
                name: 'type.name',
                visible: true,
                disabled: false,
                filter: true,
                datatype: 'text',
                project: null,
                align: 'center',
                required: false,
            },
            {
                name: 'creationDate',
                visible: false,
                disabled: false,
                filter: true,
                datatype: 'date',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'operationType',
                visible: false,
                disabled: true,
                filter: false,
                datatype: 'string',
                defaultFilter: `{ "$ne": "D" }`,
                project: null,
                align: 'left',
                required: true,
            },
        ])
    }
}
