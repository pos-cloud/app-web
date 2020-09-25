import { Printer } from '../printer/printer';
import { PaymentMethod } from '../payment-method/payment-method';
import { CompanyType } from '../company/company';
import { User } from '../user/user';
import { UseOfCFDI } from '../use-of-CFDI.component.ts/use-of-CFDI';
import { EmailTemplate } from '../email-template/email-template';
import { Branch } from '../branch/branch';

import * as moment from 'moment';
import { Application } from '../application/application.model';
import { EmployeeType } from '../employee-type/employee-type.model';
import { ShipmentMethod } from '../shipment-method/shipment-method.model';

export class TransactionType {

  public _id: string;
  public order: number = 1;
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
  public maxOrderNumber: number = 0;
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
  public resetNumber: boolean = false;
  public updateArticle: boolean = false;
  public finishCharge: boolean = true;
  public requestEmailTemplate: boolean = false;
  public defectEmailTemplate: EmailTemplate;
  public requestShipmentMethod: boolean = false;
  public defectShipmentMethod: ShipmentMethod;
  public application: Application;
  public branch: Branch;
  public level: number = 0;
  public groupsArticles: boolean = false;
  public printOrigin: boolean = false;
  public expirationDate: string = null;
  public numberPrint: number = 0;
  public creationUser: User;
  public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  public updateUser: User;
  public updateDate: string;

  constructor() { }
}

export enum Movements {
  Inflows = <any>"Entrada",
  Outflows = <any>"Salida"
}

export enum StockMovement {
  Inflows = <any>"Entrada",
  Outflows = <any>"Salida",
  Inventory = <any>"Inventario",
  Transfer = <any>"Transferencia"
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
  SinTax = <any>"Precio Sin Impuestos"
}

export enum DescriptionType {
  Code = <any>"Código",
  Description = <any>"Descripción",
  PosDescription = <any>"Descripción Corta"
}
