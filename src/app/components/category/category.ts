import { User } from '../user/user';

import * as moment from 'moment';
import { Application } from '../application/application';

export class Category {

    public _id: string;
    public order: number = 1;
    public description: string = '';
    public picture: string;
    public visibleInvoice: boolean = false;
    public visibleOnSale: boolean = true;
    public visibleOnPurchase: boolean = true;
    public ecommerceEnabled: boolean = false;
    public applications : Application[];
    public favourite : boolean = false;
    public isRequiredOptional: boolean = false;
    public parent: Category;
    public creationUser: User;
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public updateUser: User;
    public updateDate: string;

    constructor() { }
}

export let attributes = [
    {
        name: 'order',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'number',
        project: null,
        align: 'right',
        required: false,
    },
    {
        name: '_parent.name',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: '"$parent.name"',
        align: 'left',
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
        name: 'picture',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
    },
    {
        name: 'visibleInvoice',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'boolean',
        project: null,
        align: 'left',
        required: false,
    },
    {
        name: 'visibleOnSale',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'boolean',
        project: null,
        align: 'left',
        required: false,
    },
    {
        name: 'visibleOnPurchase',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'boolean',
        project: null,
        align: 'left',
        required: false,
    },
    {
        name: 'ecommerceEnabled',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'boolean',
        project: null,
        align: 'left',
        required: false,
    },
    {
        name: 'favourite',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'boolean',
        project: null,
        align: 'left',
        required: false,
    },
    {
        name: 'isRequiredOptional',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'boolean',
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
];
