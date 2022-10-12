import {IAttribute} from 'app/util/attribute.interface';
import * as moment from 'moment';

import {Application} from '../application/application.model';
import {Branch} from '../branch/branch';
import {CashBoxType} from '../cash-box-type/cash-box-type.model';
import {Company, CompanyType} from '../company/company';
import {EmailTemplate} from '../email-template/email-template';
import {EmployeeType} from '../employee-type/employee-type.model';
import {Model} from '../model/model.model';
import {PaymentMethod} from '../payment-method/payment-method';
import {Printer} from '../printer/printer';
import {ShipmentMethod} from '../shipment-method/shipment-method.model';
import {TransactionState} from '../transaction/transaction';
import {UseOfCFDI} from '../use-of-CFDI.component.ts/use-of-CFDI';
import {User} from '../user/user';

export class TransactionType extends Model {
  _id: string;
  order: number = 1;
  transactionMovement: TransactionMovement;
  abbreviation: string;
  name: string = '';
  labelPrint: string;
  currentAccount: CurrentAccount = CurrentAccount.No;
  movement: Movements = Movements.Inflows;
  modifyStock: boolean = false;
  stockMovement: StockMovement;
  requestArticles: boolean = false;
  modifyArticle: boolean = false;
  entryAmount: EntryAmount = EntryAmount.SaleWithVAT;
  requestTaxes: boolean = false;
  requestPaymentMethods: boolean = true;
  paymentMethods: PaymentMethod[];
  showKeyboard: boolean = false;
  defectOrders: boolean = false;
  electronics: boolean = false;
  codes: CodeAFIP[]; // AR
  fiscalCode: string;
  fixedOrigin: number;
  fixedLetter: string;
  maxOrderNumber: number = 0;
  showPrices: boolean = true;
  printable: boolean = false;
  defectPrinter: Printer;
  defectUseOfCFDI: UseOfCFDI;
  tax: boolean = false;
  cashBoxImpact: boolean = true;
  cashOpening: boolean = false;
  cashClosing: boolean = false;
  allowAPP: boolean = false;
  allowTransactionClose: boolean = false;
  allowEdit: boolean = false;
  allowDelete: boolean = false;
  allowZero: boolean = false;
  allowCompanyDiscount: boolean = true;
  allowPriceList: boolean = true;
  requestCurrency: boolean = false;
  requestEmployee: EmployeeType;
  requestTransport: boolean = false;
  fastPayment: PaymentMethod;
  requestCompany: CompanyType;
  isPreprinted: boolean = false;
  automaticNumbering: boolean = true;
  automaticCreation: boolean = false;
  showPriceType: PriceType = PriceType.Final;
  showDescriptionType: DescriptionType = DescriptionType.Description;
  printDescriptionType: DescriptionType = DescriptionType.Description;
  printSign: boolean = false;
  posKitchen: boolean = false;
  readLayout: boolean = false;
  updatePrice: PriceType;
  resetNumber: boolean = false;
  updateArticle: boolean = false;
  finishCharge: boolean = true;
  requestEmailTemplate: boolean = false;
  defectEmailTemplate: EmailTemplate;
  requestShipmentMethod: boolean = false;
  defectShipmentMethod: ShipmentMethod;
  application: Application;
  company: Company;
  branch: Branch;
  level: number = 0;
  groupsArticles: boolean = false;
  printOrigin: boolean = false;
  expirationDate: string;
  numberPrint: number = 0;
  orderNumber: number;
  resetOrderNumber: string;
  allowAccounting: boolean = false;
  finishState: TransactionState;
  optionalAFIP: optionalAFIP;
  cashBoxType: CashBoxType;
  creationUser: User;
  creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  updateUser: User;
  updateDate: string;

  constructor() {
    super();
  }

  static getAttributes(): IAttribute[] {
    return Model.getAttributes([
      {
        name: 'transactionMovement',
        visible: true,
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'name',
        visible: true,
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'order',
        filter: true,
        datatype: 'number',
        align: 'left',
      },
      {
        name: 'branch.name',
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'movement',
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'abbreviation',
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'labelPrint',
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'modifyStock',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'currentAccount',
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'stockMovement',
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'requestArticles',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'modifyArticle',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'entryAmount',
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'requestTaxes',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'requestPaymentMethods',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'showKeyboard',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'defectOrders',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'electronics',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'codes',
        filter: true,
        datatype: 'string',
        project: `{"$reduce":{"input":"$codes.code","initialValue":"","in":{"$concat":["$$value",{"$cond":{"if":{"$eq":["$$value",""]},"then":"","else":"; "}},{"$concat":[{"$toString":"$$this"}]}]}}}`,
        align: 'left',
      },
      {
        name: 'fiscalCode',
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'fixedOrigin',
        filter: true,
        datatype: 'number',
        align: 'left',
      },
      {
        name: 'fixedLetter',
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'maxOrderNumber',
        filter: true,
        datatype: 'number',
        align: 'left',
      },
      {
        name: 'showPrices',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'printable',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'defectPrinter.name',
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'defectUseOfCFDI.name',
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'tax',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'cashBoxImpact',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'cashOpening',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'cashClosing',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'allowAPP',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'allowTransactionClose',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'allowEdit',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'allowDelete',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'allowZero',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'allowCompanyDiscount',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'requestCurrency',
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'requestEmployee.name',
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'requestTransport',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'fastPayment.name',
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'requestCompany',
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'isPreprinted',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'automaticNumbering',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'automaticCreation',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'showPriceType',
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'showDescriptionType',
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'printDescriptionType',
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'printSign',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'posKitchen',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'readLayout',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'updatePrice',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'resetNumber',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'updateArticle',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'finishCharge',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'requestShipmentMethod',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'defectShipmentMethod.name',
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'requestEmailTemaplte',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'defectEmailTemplate.name',
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'application.name',
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'company.name',
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'optionalAFIP',
        filter: true,
        datatype: 'string',
        align: 'left',
      },
      {
        name: 'level',
        filter: true,
        datatype: 'number',
        align: 'left',
      },
      {
        name: 'groupsArticles',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'printOrigin',
        filter: true,
        datatype: 'boolean',
        align: 'left',
      },
      {
        name: 'expirationDate',
        filter: true,
        datatype: 'date',
        align: 'left',
      },
      {
        name: 'numberPrint',
        filter: true,
        datatype: 'number',
        align: 'left',
      },
      {
        name: 'finishState',
        filter: true,
        datatype: 'string',
        align: 'left',
      },
    ]);
  }
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
