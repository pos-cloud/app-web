import { Article, ArticleType } from './article';
import { Transaction } from './transaction';

export class MovementOfArticle {

    public _id: string;
    public code: number = 1;
    public description: string = "";
    public observation: string;
    public salePrice: number = 0.00;
    public totalPrice: number = 0.00;
    public make: string;
    public category: string;
    public barcode: string;
    public amount: number = 1;
    public notes: string;
    public type: ArticleType;
    public printed: number = 0;
    public article: Article = null;
    public transaction: Transaction = null;

	constructor () {}
}