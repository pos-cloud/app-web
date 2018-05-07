import { Make } from './make';
import { Category } from './category';

export class Article {

    public _id: string;
    public type: ArticleType = ArticleType.Final;
    public containsVariants: boolean = false;
    public code: string = "00001";
    public description: string = "";
    public posDescription: string = "";
    public observation: string;
    public basePrice: number = 0.00;
    public VATPercentage: number = 21.00;
    public VATAmount: number = 0.00;
    public costPrice: number = 0.00;
    public markupPercentage: number = 0.00;
    public markupPrice: number = 0.00;
    public salePrice: number = 0.00;
    public make: Make;
    public category: Category;
    public stock: number = 0;
    public barcode: string;
    public printIn: ArticlePrintIn = ArticlePrintIn.Counter;
    public printed: boolean;
    public picture: string;

    constructor() {}
}

export enum ArticlePrintIn {
    Bar = <any> "Bar",
    Kitchen = <any> "Cocina",
    Counter = <any> "Mostrador"
}

export enum ArticleType {
    Final = <any>"Final",
    Variant = <any>"Variante",
    Ingredient = <any>"Ingrediente"
}