import { Model } from '../model/model.model';
import { IAttribute } from 'app/util/attribute.interface';

export class CompanyGroup extends Model {

    public description: string;
    public discount: number;

    constructor() { super(); }

    static getAttributes(): IAttribute[] {
        return Model.getAttributes([
            {
                name: 'description',
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
                name: 'discount',
                visible: true,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'number',
                project: null,
                align: 'center',
                required: false,
            }
        ])
    }
}
