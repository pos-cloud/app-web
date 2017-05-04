export class SaleOrder {
	
	public code: number = 0;
	public date: Date = new Date();
	public status: any = SaleOrderStatus.Open;
	public observation: string;
	public totalPrice: number = 0.00;

	constructor () {}
}

export enum SaleOrderStatus {
	Open = <any> "Abierto",
	Pending = <any> "Pendiente",
	Closed = <any> "Cerrado"
}