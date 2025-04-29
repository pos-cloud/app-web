import {
  Activity,
  Application,
  Branch,
  CashBoxType,
  Company,
  CompanyType,
  EmailTemplate,
  EmployeeType,
  PaymentMethod,
  Printer,
  ShipmentMethod,
  TransactionState,
  UseOfCFDI,
} from '@types';

export interface TransactionType extends Activity {
  _id: string;
  order: number; // default 1
  transactionMovement: TransactionMovement;
  abbreviation: string;
  name: string; // default ''
  labelPrint: string;
  currentAccount: CurrentAccount; // default CurrentAccount.No
  movement: Movements; // default Movements.Inflows
  modifyStock: boolean; // default false
  stockMovement: StockMovement;
  requestArticles: boolean; // default false
  modifyArticle: boolean; // default false
  entryAmount: EntryAmount; // default EntryAmount.SaleWithVAT
  requestTaxes: boolean; // default false
  requestPaymentMethods: boolean; // default true
  paymentMethods: PaymentMethod[];
  showKeyboard: boolean; // default false
  defectOrders: boolean; // default false
  electronics: boolean; // default false
  codes: CodeAFIP[]; // AR
  fiscalCode: string;
  fixedOrigin: number;
  fixedLetter: string;
  maxOrderNumber: number; // default 0
  showPrices: boolean; // default true
  printable: boolean; // default false
  defectPrinter: Printer;
  defectUseOfCFDI: UseOfCFDI;
  tax: boolean; // default false
  cashBoxImpact: boolean; // default true
  cashOpening: boolean; // default false
  cashClosing: boolean; // default false
  allowAPP: boolean; // default false
  allowTransactionClose: boolean; // default true
  allowEdit: boolean; // default false
  allowDelete: boolean; // default false
  allowZero: boolean; // default false
  allowCompanyDiscount: boolean; // default true
  allowPriceList: boolean; // default true
  requestCurrency: boolean; // default false
  requestEmployee: EmployeeType;
  requestTransport: boolean; // default false
  fastPayment: PaymentMethod;
  requestCompany: CompanyType;
  isPreprinted: boolean; // default false
  automaticNumbering: boolean; // default true
  automaticCreation: boolean; // default false
  showPriceType: PriceType; // default PriceType.Final
  showDescriptionType: DescriptionType; // default DescriptionType.Description
  printDescriptionType: DescriptionType; // default DescriptionType.Description
  printSign: boolean; // default false
  posKitchen: boolean; // default false
  readLayout: boolean; // default false
  updatePrice: PriceType;
  resetNumber: boolean; // default false
  updateArticle: boolean; // default false
  finishCharge: boolean; // default true
  requestEmailTemplate: boolean; // default false
  defectEmailTemplate: EmailTemplate;
  requestShipmentMethod: boolean; // default false
  defectShipmentMethod: ShipmentMethod;
  application: Application;
  company: Company;
  branch: Branch;
  level: number; // default 0
  groupsArticles: boolean; // default false
  printOrigin: boolean; // default false
  expirationDate: string;
  numberPrint: number; // default 0
  orderNumber: number;
  resetOrderNumber: string;
  allowAccounting: boolean; // default false
  finishState: TransactionState;
  optionalAFIP: optionalAFIP;
  cashBoxType: CashBoxType;
}

export enum Movements {
  Inflows = <any>'Entrada',
  Outflows = <any>'Salida',
}

export enum StockMovement {
  Inflows = <any>'Entrada',
  Outflows = <any>'Salida',
  Inventory = <any>'Inventario',
  Transfer = <any>'Transferencia',
}

export enum CurrentAccount {
  Yes = <any>'Si',
  No = <any>'No',
  Charge = <any>'Cobra',
}

export class CodeAFIP {
  letter: string;
  code: number;
}

export enum TransactionMovement {
  Sale = <any>'Venta',
  Purchase = <any>'Compra',
  Stock = <any>'Stock',
  Money = <any>'Fondos',
  Production = <any>'Producción',
}

export enum EntryAmount {
  CostWithoutVAT = <any>'Costo sin IVA',
  CostWithVAT = <any>'Costo con IVA',
  SaleWithoutVAT = <any>'Venta sin IVA',
  SaleWithVAT = <any>'Venta con IVA',
}

export enum PriceType {
  Base = <any>'Precio Base',
  Final = <any>'Precio Final',
  SinTax = <any>'Precio Sin Impuestos',
  Purchase = <any>'Ultima Compra',
}

export enum DescriptionType {
  Code = <any>'Código',
  Description = <any>'Descripción',
  PosDescription = <any>'Descripción Corta',
}

export interface optionalAFIP {
  id: string;
  name: string;
  value: string;
}
