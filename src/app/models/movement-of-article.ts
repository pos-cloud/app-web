import { Article } from './article';
import { SaleOrder } from './sale-order';

export class MovementOfArticle {

    private code: number = 0;
    private description: string;
    private observation: string;
    private salePrice: number = 0.00;
    private make: string;
    private category: string;
    private unitOfMeasure: string;
    private stock: number = 0;
    private barcode: string;
    private amount: number = 1;
    private saleOrder: SaleOrder = null;

	constructor () {}

    public setCode(code: number): void {
        this.code = code;
    }

    public setSalePrice(salePrice: number): void {
        this.salePrice = salePrice;
    }

    public setAmount(amount: number): void {
        this.amount = amount;
    }
}