import { Model } from '../model/model.model';
import * as moment from 'moment';
import 'moment/locale/es';

export class Holiday extends Model {

    public name: String;
    public date: Date;

    constructor() { super(); }

    static getAttributes(): {
        name: string,
        visible: boolean,
        disabled: boolean,
        filter: boolean,
        defaultFilter: string,
        datatype: string,
        project: any,
        align: string,
        required: boolean
    }[] {
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
