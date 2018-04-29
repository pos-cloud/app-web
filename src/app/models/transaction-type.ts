import { Printer } from './printer';

export class TransactionType {

	public _id: string;
	public transactionMovement: TransactionMovement;
	public name: string = "";
	public labelPrint: string;
	public currentAccount: CurrentAcount = CurrentAcount.No;
	public movement: Movements = Movements.Inflows;
	public modifyStock: ModififyStock = ModififyStock.No;
	public stockMovement: StockMovement = StockMovement.Inflows;
	public requestArticles: RequestArticles = RequestArticles.No;
	public defectOrders: DefectOrders = DefectOrders.No;
	public electronics: string = "No";
	public codes: CodeAFIP[];
	public fixedOrigin: number = 1;
	public fixedLetter: string;
	public printable: string = "No";
	public defectPrinter: Printer;
	public tax: string = "No";

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

export enum ModififyStock {
	Yes = <any>"Si",
	No = <any>"No"
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

export enum RequestArticles {
	Yes = <any>"Si",
	No = <any>"No"
}

export enum DefectOrders {
	Yes = <any>"Si",
	No = <any>"No"
}

export enum TransactionMovement {
	Sale = <any>"Venta",
	Purchase = <any>"Compra",
	Stock = <any>"Stock"
}