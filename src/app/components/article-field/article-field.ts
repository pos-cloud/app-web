import { User } from '../user/user';
import * as moment from 'moment';
export class ArticleField {

	public _id: string;
	public order: number = 1;
	public name: string;
	public datatype: ArticleFieldType = ArticleFieldType.Percentage;
	public value: string;
    public modify: boolean = false;
    public modifyVAT: boolean = false;
    public discriminateVAT : boolean = false;
    public ecommerceEnabled : boolean = false;
    public operationType: string;
	public creationUser: User;
	public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	public updateUser: User;
	public updateDate: string;
	

	constructor() { }
}

export enum ArticleFieldType {
    Percentage = <any> "Porcentaje",
    Number = <any> "Número",
    String = <any> "Alfabético",
    Array = <any> "Lista"
}
