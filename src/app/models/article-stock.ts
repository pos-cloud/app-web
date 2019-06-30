import { Article } from './article';

export class ArticleStock {

	public _id: string;
	public article: Article;
	public realStock: number = 0.00;
	public minStock: number = 0.00;
	public maxStock: number = 0.00;

	constructor() { }
}