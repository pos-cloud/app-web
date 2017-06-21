import { Make } from './make';
import { Category } from './category';

export class Article {

    public _id: string;
    public code: number = 1;
    public description: string;
    public observation: string;
    public salePrice: number = 0.00;
    public make: Make;
    public category: Category;
    public unitOfMeasure: string;
    public stock: number = 0;
    public barcode: string;
    public type: ArticleType = ArticleType.Counter;

    constructor() {}
}

export enum ArticleType {
    Bar = <any> "Bar",
    Kitchen = <any> "Cocina",
    Counter = <any> "Mostrador"
}