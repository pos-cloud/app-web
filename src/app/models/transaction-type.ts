import { Printer } from './printer';
import { EmployeeType } from './employee-type';
import { PaymentMethod } from './payment-method';
import { CompanyType } from './company';
import { User } from './user';
import { UseOfCFDI } from './use-of-CFDI';

import * as moment from 'moment';
import 'moment/locale/es';

export class TransactionType {

	public _id: string;
	public transactionMovement: TransactionMovement;
	public abbreviation: string;
	public name: string = '';
	public labelPrint: string;
	public currentAccount: CurrentAccount = CurrentAccount.No;
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
	public codes: CodeAFIP[]; // AR
	public fiscalCode: string;
	public fixedOrigin: number;
	public fixedLetter: string;
	public resetNumber: boolean = false;
	public showPrices: boolean = true;
	public printable: boolean = false;
	public defectPrinter: Printer;
	public defectUseOfCFDI: UseOfCFDI;
	public tax: boolean = false;
	public cashBoxImpact: boolean = true;
	public cashOpening: boolean = false;
	public cashClosing: boolean = false;
	public allowAPP: boolean = false;
	public allowEdit: boolean = false;
	public allowDelete: boolean = false;
	public allowZero: boolean = false;
	public requestCurrency: boolean = false;
	public requestEmployee: EmployeeType;
	public requestTransport: boolean = false;
	public fastPayment: PaymentMethod;
	public requestCompany: CompanyType;
	public isPreprinted: boolean = false;
	public automaticNumbering: boolean = true;
	public automaticCreation: boolean = false;
	public showPriceType: PriceType = PriceType.Final;
	public showDescriptionType: DescriptionType = DescriptionType.Description;
	public printDescriptionType: DescriptionType = DescriptionType.Description;
	public printSign: boolean = false;
	public posKitchen: boolean = false;
	public readLayout: boolean = false;
	public updatePrice: boolean = false;
    public updateArticle: boolean = false;
    public expirationDate : string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	public creationUser: User;
	public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	public updateUser: User;
	public updateDate: string;

	constructor() { }
}

export enum Movements {
	Inflows = <any> "Entrada",
	Outflows = <any> "Salida"
}

export enum StockMovement {
	Inflows = <any>"Entrada",
	Outflows = <any>"Salida",
	Inventory = <any> "Inventario",
	Transfer = <any> "Transferencia"
}

export enum CurrentAccount {
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
	CostWithVAT = <any>"Costo con IVA",
	SaleWithoutVAT = <any>"Venta sin IVA",
	SaleWithVAT = <any>"Venta con IVA"
}

export enum PriceType {
	Base = <any>"Precio Base",
	Final = <any>"Precio Final",
	SinTax = <any> "Precio Sin Impuestos"
}

export enum DescriptionType {
	Code = <any>"Código",
	Description = <any>"Descripción",
	PosDescription = <any> "Descripción Corta"
}
