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
import { TransactionMovement } from './transaction.interface';

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
  printBalanceOnCanceled: boolean; // default false
  expirationDate: string;
  numberPrint: number; // default 0
  orderNumber: number;
  resetOrderNumber: string;
  allowAccounting: boolean; // default false
  finishState: TransactionState;
  optionalAFIP: optionalAFIP;
  cashBoxType: CashBoxType;
  printBalanceAccount: boolean; // default false
  isSubscription: boolean; // default false
  view: View; // default View.Formal
}

export enum View {
  Formal = 'formal',
  Fast = 'fast',
}
export enum Movements {
  Inflows = 'Entrada',
  Outflows = 'Salida',
}

export enum StockMovement {
  Inflows = 'Entrada',
  Outflows = 'Salida',
  Inventory = 'Inventario',
  Transfer = 'Transferencia',
}

export enum CurrentAccount {
  Yes = 'Si',
  No = 'No',
  Charge = 'Cobra',
}

export class CodeAFIP {
  letter: string;
  code: number;
}

// export enum TransactionMovement {
//   Sale = <any>'Venta',
//   Purchase = <any>'Compra',
//   Stock = <any>'Stock',
//   Money = <any>'Fondos',
//   Production = <any>'Producción',
// }

export enum EntryAmount {
  CostWithoutVAT = 'Costo sin IVA',
  CostWithVAT = 'Costo con IVA',
  SaleWithoutVAT = 'Venta sin IVA',
  SaleWithVAT = 'Venta con IVA',
}

export enum PriceType {
  Base = 'Precio Base',
  Final = 'Precio Final',
  SinTax = 'Precio Sin Impuestos',
  Purchase = 'Ultima Compra',
}

export enum DescriptionType {
  Code = 'Código',
  Description = 'Descripción',
  PosDescription = 'Descripción Corta',
}

export interface optionalAFIP {
  id: string;
  name: string;
  value: string;
}

// Opciones de datos opcionales de AFIP (RG). Antes se servían como JSON estático
// desde assets/datos/optionalAFIP.json; se mantienen acá para evitar un request HTTP.
export const OPTIONAL_AFIP: Pick<optionalAFIP, 'id' | 'name'>[] = [
  { id: '2', name: 'RG Empresas Promovidas - Indentificador de proyecto vinculado a Régimen de Promoción Industrial' },
  { id: '91', name: 'RG Bienes Usados 3411 - Nombre y Apellido o Denominación del vendedor del bien usado.' },
  { id: '92', name: 'RG Bienes Usados 3411 - Nacionalidad del vendedor del bien usado.' },
  { id: '93', name: 'RG Bienes Usados 3411 - Domicilio del vendedor del bien usado.' },
  { id: '5', name: 'Excepcion computo IVA Credito Fiscal' },
  { id: '61', name: 'RG 3668 Impuesto al Valor Agregado - Art.12 IVA Firmante Doc Tipo' },
  { id: '62', name: 'RG 3668 Impuesto al Valor Agregado - Art.12 IVA Firmante Doc Nro' },
  { id: '7', name: 'RG 3668 Impuesto al Valor Agregado - Art.12 IVA Carácter del Firmante' },
  { id: '10', name: 'RG 3.368 Establecimientos de educación pública de gestión privada - Actividad Comprendida' },
  { id: '1011', name: 'RG 3.368 Establecimientos de educación pública de gestión privada - Tipo de Documento' },
  { id: '1012', name: 'RG 3.368 Establecimientos de educación pública de gestión privada - Número de Documento' },
  { id: '11', name: 'RG 2.820 Operaciones económicas vinculadas con bienes inmuebles - Actividad Comprendida' },
  { id: '12', name: 'RG 3.687 Locación temporaria de inmuebles con fines turísticos - Actividad Comprendida' },
  { id: '13', name: 'RG 2.863 Representantes de Modelos' },
  { id: '14', name: 'RG 2.863 Agencias de publicidad' },
  { id: '15', name: 'RG 2.863 Personas físicas que desarrollen actividad de modelaje' },
  {
    id: '17',
    name: "RG 4004-E Locación de inmuebles destino 'casa-habitación'. Dato 2 (dos) = facturación directa / Dato 1 (uno) = facturación a través de intermediario",
  },
  {
    id: '1801',
    name: "RG 4004-E Locación de inmuebles destino 'casa-habitación'. Clave Única de Identificación Tributaria (CUIT).",
  },
  {
    id: '1802',
    name: "RG 4004-E Locación de inmuebles destino 'casa-habitación'. Apellido y nombres, denominación y/o razón social.",
  },
  { id: '2101', name: 'Factura de Crédito Electrónica MiPyMEs (FCE) - CBU del Emisor' },
  { id: '2102', name: 'Factura de Crédito Electrónica MiPyMEs (FCE) - Alias del Emisor' },
  { id: '22', name: 'Factura de Crédito Electrónica MiPyMEs (FCE) - Anulación' },
  { id: '23', name: 'Factura de Crédito Electrónica MiPyMEs (FCE) - Referencia Comercial' },
  { id: '27', name: 'Factura de Credito Electronica MiPyMEs (FCE) - Transferencia' },
];
