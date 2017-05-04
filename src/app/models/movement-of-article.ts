import { Article } from './article';
import { SaleOrder } from './sale-order';

export class MovementOfArticle {

    public code: number = 1;
    public description: string;
    public observation: string;
    public salePrice: number = 0.00;
    public make: string;
    public category: string;
    public unitOfMeasure: string;
    public stock: number = 0;
    public barcode: string;
    public amount: number = 1;
    public saleOrder: SaleOrder = null;

	constructor () {}
}