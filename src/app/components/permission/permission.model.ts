import { Model } from '../model/model.model';

export class Permission extends Model {

    public name: string;

    public collections: {
        name: string,
        actions: {
            add: boolean,
            edit: boolean,
            delete: boolean,
            export: boolean
        }
    }[];

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
                align: 'center',
                required: true,
            }
        ])
    }
}