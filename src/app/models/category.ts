import { User } from './user';

import * as moment from 'moment';
import 'moment/locale/es';

export class Category {

	public _id: string;
	public order: number = 1;
	public description: string = '';
	public picture: string;
	public visibleInvoice: boolean = false;
	public visibleOnSale: boolean = true;
	public visibleOnPurchase: boolean = true;
    public ecommerceEnabled: boolean = false;
    public isRequiredOptional: boolean = false;
	public creationUser: User;
	public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	public updateUser: User;
	public updateDate: string;

	constructor() { }
}
