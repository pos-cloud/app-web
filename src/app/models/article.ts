import { Validators } from '@angular/forms';

export class Article {

    public code: number = 0;
    public description: string;
    public observation: string;
    public salePrice: number = 0.00;
    public make: string;
    public category: String;
    public unitOfMeasure: string;
    public stock: number = 0;
    public barcode: string;

    constructor() {}

    public setCode(code: number): void {
        this.code = code;
    }
}