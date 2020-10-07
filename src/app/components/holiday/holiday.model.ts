import { Model } from '../model/model.model';
import * as moment from 'moment';
import 'moment/locale/es';
import { IAttribute } from 'app/util/attribute.interface';

export class Holiday extends Model {

    public name: string;
    public date: Date;

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
                name: 'date',
                visible: true,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'date',
                project: null,
                align: 'left',
                required: false,
            }
        ])
    }
}
