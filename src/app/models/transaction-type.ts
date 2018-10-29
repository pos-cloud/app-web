import { Printer } from './printer';
import { EmployeeType } from './employee-type';
import { PaymentMethod } from './payment-method';

export class TransactionType {

	public _id: string;
	public transactionMovement: TransactionMovement;
	public name: string = '';
	public labelPrint: string;
	public currentAccount: CurrentAcount = CurrentAcount.No;
	public movement: Movements = Movements.Inflows;
	public modifyStock: boolean = false;
	public stockMovement: StockMovement = StockMovement.Inflows;
	public requestArticles: boolean = false;
	public modifyArticle: boolean = false;
	public entryAmount: EntryAmount = EntryAmount.SaleWithVAT;
	public requestTaxes: boolean = false;
	public requestPaymentMethods: boolean = true;
	public defectOrders: boolean = false;
	public electronics: boolean = false;
	public codes: CodeAFIP[];
	public fixedOrigin: number = 1;
	public fixedLetter: string;
	public resetNumber: boolean = false;
	public showPrices: boolean = true;
	public printable: boolean = false;
	public defectPrinter: Printer;
	public tax: boolean = false;
	public cashOpening: boolean = false;
	public cashClosing: boolean = false;
  public allowAPP: boolean = false;
  public allowEdit: boolean = false;
  public allowDelete: boolean = false;
  public requestEmployee: EmployeeType;
  public fastPayment: PaymentMethod;

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
	Stock = <any>"Stock",
	Money = <any>"Fondos"
}

export enum EntryAmount {
	CostWithoutVAT = <any>"Costo sin IVA",
	CostWithVAT = <any>"Conto con IVA",
	SaleWithoutVAT = <any>"Venta sin IVA",
	SaleWithVAT = <any>"Venta con IVA"
}
