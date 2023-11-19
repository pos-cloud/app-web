import Model from "./model"
import Printer from "./printer"

export interface TransactionType extends Model {
  order: number
//   branch: Branch
//   transactionMovement: TransactionMovement
  abbreviation: string
  name: string
  labelPrint: string
//   currentAccount: CurrentAccount
  movement: Movements
  modifyStock: boolean
//   stockMovement: StockMovement
  requestArticles: boolean
  modifyArticle: boolean
  entryAmount: string
  requestTaxes: boolean
  defectOrders: boolean
  allowAPP: boolean
  allowTransactionClose: boolean
  allowEdit: boolean
  allowDelete: boolean
  allowZero: boolean
  allowCompanyDiscount: boolean
  allowPriceList: boolean
  electronics: boolean
  codes: [{letter: string; code: number}]
  fiscalCode: string
  fixedOrigin: number
  defectPrinter: Printer
  fixedLetter: string
  maxOrderNumber: number
  tax: boolean
  cashBoxImpact: boolean
  cashOpening: boolean
  cashClosing: boolean
  requestPaymentMethods: boolean
  showKeyboard: boolean
  requestCurrency: boolean
  requestTransport: boolean
  showPrices: boolean
  automaticNumbering: boolean
//   requestEmployee: EmployeeType
//   fastPayment: PaymentMethod
//   defectUseOfCFDI: UseOfCFDI
  isPreprinted: boolean
  showPriceType: string
  showDescriptionType: string
  printDescriptionType: string
  printSign: boolean
  posKitchen: boolean
  finishCharge: boolean
  readLayout: boolean
  expirationDate: Date
  updatePrice: string
  updateArticle: boolean
  requestEmailTemplate: boolean
//   defectEmailTemplate: EmailTemplate
  requestShipmentMethod: boolean
//   defectShipmentMethod: ShipmentMethod
//   application: Application
  groupsArticles: boolean
  printOrigin: boolean
//   company: Company
//   paymentMethods: PaymentMethod[]
  orderNumber: number
  resetOrderNumber: string
  allowAccounting: boolean
//   finishState: TransactionState
  optionalAFIP: {
    id: string
    name: string
    value: string
  }
//   cashBoxType: CashBoxType
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
  letter: string
  code: number
}

export enum TransactionMovement {
  Sale = <any>'Venta',
  Purchase = <any>'Compra',
  Stock = <any>'Stock',
  Money = <any>'Fondos',
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
}

export enum DescriptionType {
  Code = <any>'Código',
  Description = <any>'Descripción',
  PosDescription = <any>'Descripción Corta',
}
