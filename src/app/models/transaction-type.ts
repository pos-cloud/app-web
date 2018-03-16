import { Printer } from './printer';

export class TransactionType {

	public _id: string;
	public name: string = "";
	public currentAccount: CurrentAcount = CurrentAcount.No;
	public movement: Movements = Movements.Inflows;
	public requestArticles: RequestArticles = RequestArticles.No;
	public defectOrders: DefectOrders = DefectOrders.No;
	public electronics: string;
	public codes: CodeAFIP[];
	public fixedOrigin: number;
	public fixedLetter: string;
	public printable: string;
	public defectPrinter: Printer;

	constructor() { }
}

export enum Movements {
	Inflows = <any> "Entrada",
	Outflows = <any> "Salida"
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