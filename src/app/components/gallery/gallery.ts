import { User } from '../user/user';

import * as moment from 'moment';
import 'moment/locale/es';
import { Resource } from '../resource/resource';

export class Gallery {

    public _id: string;
    public name: string = '';
    public colddown: number;
    public speed: number;
    public barcode: boolean = false;
    public resources: [{
        resource: Resource,
        order: number
    }];
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public updateUser: User;
    public updateDate: string;

    constructor() { }
}
