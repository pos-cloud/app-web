import { Article, ArticleType } from './article';
import { Transaction } from './transaction';

export class MovementOfArticle {

    public _id: string;
    public code: string = "1";
    public description: string = "";
    public observation: string;
    public basePrice: number = 0.00;
    public VATPercentage: number = 21.00;
    public VATAmount: number = 0.00;
    public costPrice: number = 0.00;
    public markupPercentage: number = 0.00;
    public markupPrice: number = 0.00;
    public salePrice: number = 0.00;
    public make: string;
    public category: string;
    public barcode: string;
    public amount: number = 1;
    public notes: string;
    public type: ArticleType;
    public printed: number = 0;
    public transaction: Transaction = null;

	constructor () {}
}