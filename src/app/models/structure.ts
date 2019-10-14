import * as moment from 'moment';
import 'moment/locale/es';
import { User } from './user';
import { Article } from './article';

export class Structure {

    public _id: string;
    public parent: Article;
    public child: Article;
    public quantity: number = 0;
    public utilization: Utilization = Utilization.Sales;
	public creationUser: User;
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public updateUser: User;
    public updateDate: string;
    constructor() { }
}

export enum Utilization {
    Productions = <any> "Produccion",
    Sales = <any> "Ventas",
}
