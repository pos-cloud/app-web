export class SaleOrder {
	
	private code: number = 0;
	private date: Date = new Date();
	private status: any = SaleOrderStatus.Open;
	private observation: string;
	private totalPrice: number = 0.00;

	constructor () {}

	public setTotalPrice(totalPrice: number): void {
        this.totalPrice = totalPrice;
    }

	public getTotalPrice(): number {
        return this.totalPrice;
    }
}

export enum SaleOrderStatus {
	Open = <any> "Abierto",
	Pending = <any> "Pendiente",
	Closed = <any> "Cerrado"
}