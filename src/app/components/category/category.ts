import * as moment from 'moment';
import { User } from '../user/user';
import { Application } from '../application/application.model';
import { IAttribute } from 'app/util/attribute.interface';
import { Model } from '../model/model.model';

export class Category extends Model {

    public _id: string;
    public order: number = 1;
    public description: string = '';
    public picture: string;
    public visibleInvoice: boolean = false;
    public visibleOnSale: boolean = true;
    public visibleOnPurchase: boolean = true;
    public ecommerceEnabled: boolean = false;
    public applications: Application[];
    public favourite: boolean = false;
    public isRequiredOptional: boolean = false;
    public wooId: string;
    public parent: Category;
    public creationUser: User;
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public updateUser: User;
    public updateDate: string;

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
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: '_parent.name',
                visible: false,
                disabled: false,
                filter: true,
                datatype: 'string',
                project: '"$parent.description"',
                align: 'left',
                required: false,
            },
            {
                name: 'picture',
                visible: false,
                disabled: false,
                filter: true,
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'visibleInvoice',
                visible: false,
                disabled: false,
                filter: true,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'visibleOnSale',
                visible: false,
                disabled: false,
                filter: true,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'visibleOnPurchase',
                visible: false,
                disabled: false,
                filter: true,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'ecommerceEnabled',
                visible: false,
                disabled: false,
                filter: true,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'favourite',
                visible: false,
                disabled: false,
                filter: true,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'isRequiredOptional',
                visible: false,
                disabled: false,
                filter: true,
                datatype: 'boolean',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'wooId',
                visible: false,
                disabled: false,
                filter: true,
                datatype: 'string',
                project: null,
                align: 'left',
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
