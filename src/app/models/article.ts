import { Make } from './make';
import { Category } from './category';

export class Article {

    public _id: string;
    public code: String = "1";
    public description: string = "";
    public posDescription: string = "";
    public observation: string;
    public costPrice: number = 0.00;
    public VATPercentage: number = 21.00;
    public VATAmount: number = 0.00;
    public markupPercentage: number = 0.00;
    public markupPrice: number = 0.00;
    public salePrice: number = 0.00;
    public make: Make;
    public category: Category;
    public stock: number = 0;
    public barcode: string;
    public type: ArticleType = ArticleType.Counter;
    public printed: boolean;
    public picture: string;


    constructor() {}
}

export enum ArticleType {
    Bar = <any> "Bar",
    Kitchen = <any> "Cocina",
    Counter = <any> "Mostrador"
}