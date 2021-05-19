import { IAttribute } from 'app/util/attribute.interface';
import { Article } from '../article/article';
import { Category } from '../category/category';
import { EmailTemplate } from '../email-template/email-template';
import { Model } from '../model/model.model';

export class Report extends Model {

    public name: string;
    public query: string;
    public table : string;

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