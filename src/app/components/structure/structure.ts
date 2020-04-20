import * as moment from 'moment';
import 'moment/locale/es';
import { User } from '../user/user';
import { Article } from '../article/article';

export class Structure {

    public _id: string;
    public parent: Article;
    public child: Article;
    public quantity: number = 0;
    public utilization: Utilization = Utilization.Sale;
    public optional: boolean = false;
    public increasePrice: number;
    public creationUser: User;
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public updateUser: User;
    public updateDate: string;
    constructor() { }
}

export enum Utilization {
    Production = <any>"Produccion",
    Sale = <any>"Venta"
}
