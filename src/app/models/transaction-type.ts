import { Printer } from './printer';

export class TransactionType {

	public _id: string;
	public transactionMovement: TransactionMovement;
	public name: string = "";
	public labelPrint: string;
	public currentAccount: CurrentAcount = CurrentAcount.No;
	public movement: Movements = Movements.Inflows;
	public modifyStock: boolean = false;
	public stockMovement: StockMovement = StockMovement.Inflows;
	public requestArticles: boolean = false;
	public defectOrders: boolean = false;
	public electronics: boolean = false;
	public codes: CodeAFIP[];
	public fixedOrigin: number = 1;
	public fixedLetter: string;
	public printable: boolean = false;
	public defectPrinter: Printer;
	public tax: boolean = false;

	constructor() { }
}

export enum Movements {
	Inflows = <any> "Entrada",
	Outflows = <any> "Salida"
}

export enum StockMovement {
	Inflows = <any>"Entrada",
	Outflows = <any>"Salida"
}

export enum CurrentAcount {
	Yes = <any>"Si",
	No = <any>"No",
	Charge = <any>"Cobra"
}

export class CodeAFIP {
	letter: string;
	code: number;
}

export enum TransactionMovement {
	Sale = <any>"Venta",
	Purchase = <any>"Compra",
	Stock = <any>"Stock"
}