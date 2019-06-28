import { Article } from './article';
import { Deposit } from './deposit';
import { Branch } from './branch';

export class ArticleStock {

	public _id: string;
	public article: Article;
	public branch: Branch;
	public deposit: Deposit;
	public realStock: number = 0.00;
	public minStock: number = 0.00;

	constructor() { }
}