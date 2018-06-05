import { Make } from './make';
import { Category } from './category';
import { Taxes } from './taxes';

export class Article {

    public _id: string;
    public type: ArticleType = ArticleType.Final;
    public containsVariants: boolean = false;
    public code: string = "00001";
    public description: string = "";
    public posDescription: string = "";
    public variantDescription: string;
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
    public printIn: ArticlePrintIn = ArticlePrintIn.Counter;
    public allowPurchase: Boolean = true;
    public allowSale: Boolean = true;
    public allowSaleWithoutStock: Boolean = false;
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