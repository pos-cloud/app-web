import { Article, ArticlePrintIn } from './article';
import { Transaction } from './transaction';
import { Make } from './make';
import { Category } from './category';
import { Taxes } from './taxes';

export class MovementOfArticle {

    public _id: string;
    public code: string = "1";
    public description: string = "";
    public observation: string;
    public basePrice: number = 0.00;
    public taxes: Taxes[];
    public costPrice: number = 0.00;
    public markupPercentage: number = 0.00;
    public markupPrice: number = 0.00;
    public salePrice: number = 0.00;
    public make: Make;
    public category: Category;
    public barcode: string;
    public amount: number = 1;
    public notes: string;
    public printIn: ArticlePrintIn;
    public printed: number = 0;
    public article: Article;
    public transaction: Transaction = null;

	constructor () {}
}