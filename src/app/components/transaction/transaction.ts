import {Employee} from 'app/components/employee/employee';
import * as moment from 'moment';

import {Account} from '../account/account';
import {Address} from '../address/address.model';
import {Branch} from '../branch/branch';
import {BusinessRule} from '../business-rules/business-rules';
import {CashBox} from '../cash-box/cash-box';
import {Company} from '../company/company';
import {Currency} from '../currency/currency';
import {Deposit} from '../deposit/deposit';
import {PriceList} from '../price-list/price-list';
import {RelationType} from '../relation-type/relation-type';
import {ShipmentMethod} from '../shipment-method/shipment-method.model';
import {Table} from '../table/table';
import {Taxes} from '../tax/taxes';
import {TransactionType} from '../transaction-type/transaction-type';
import {Transport} from '../transport/transport';
import {UseOfCFDI} from '../use-of-CFDI.component.ts/use-of-CFDI';
import {User} from '../user/user';

export class Transaction {
  _id: string;
  origin: number = 0;
  letter: string = '';
  number: number = 0;
  startDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  endDate: string;
  expirationDate: string;
  VATPeriod: string = moment().format('YYYYMM');
  state: TransactionState = TransactionState.Open;
  basePrice: number = 0.0;
  exempt: number = 0.0;
  taxes: Taxes[];
  discountAmount: number = 0.0;
  discountPercent: number = 0.0;
  commissionAmount: number = 0.0;
  administrativeExpenseAmount: number = 0.0;
  otherExpenseAmount: number = 0.0;
  totalPrice: number = 0.0;
  roundingAmount: number = 0.0;
  diners: number = 0;
  orderNumber: number = 0;
  observation: string;
  madein: string;
  balance: number = 0.0;
  CAE: string; // AR
  CAEExpirationDate: string; // AR
  relationType: RelationType; // MX
  useOfCFDI: UseOfCFDI; // MX
  stringSAT: string; // MX
  CFDStamp: string; // MX
  SATStamp: string; // MX
  UUID: string; // MX
  type: TransactionType;
  company: Company;
  cashBox: CashBox;
  currency: Currency;
  quotation: number;
  printed: number;
  table: Table;
  employeeOpening: Employee;
  employeeClosing: Employee;
  deliveryAddress: Address;
  branchOrigin: Branch;
  branchDestination: Branch;
  depositOrigin: Deposit;
  depositDestination: Deposit;
  transport: Transport;
  shipmentMethod: ShipmentMethod;
  priceList: PriceList;
  businessRules: BusinessRule[];
  paymentMethodEcommerce: string;
  wooId: string;
  declaredValue: number;
  package: number;
  account: Account;
  optionalAFIP: {
    id: string;
    value: string;
  };
  creationUser: User;
  creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  updateUser: User;
  updateDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  tracking: {date: string; state: TransactionState}[];
  tiendaNubeId: string;

  constructor() {}
}

export enum TransactionState {
  Open = <any>'Abierto',
  Outstanding = <any>'Pendiente de pago',
  PaymentConfirmed = <any>'Pago Confirmado',
  PaymentDeclined = <any>'Pago Rechazado',
  Canceled = <any>'Anulado',
  Packing = <any>'Armando',
  Closed = <any>'Cerrado',
  Delivered = <any>'Entregado',
  Sent = <any>'Enviado',
  Preparing = <any>'Preparando',
  Pending = <any>'Pendiente',
  Produccion= <any>'En Producción'
}

export let attributes = [
  {
    name: 'type._id',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'type.name',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'origin',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'number',
    project: `{"$toString" : "$origin"}`,
    align: 'center',
    required: false,
  },
  {
    name: 'letter',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'center',
    required: false,
  },
  {
    name: 'number',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'number',
    project: `{"$toString" : "$number"}`,
    align: 'right',
    required: false,
  },
  {
    name: 'endDate',
    visible: true,
    disabled: false,
    filter: false,
    datatype: 'string',
    project: `{ "$dateToString": { "date": "$endDate", "format": "%d/%m/%Y", "timezone": "-03:00" } }`,
    align: 'right',
    required: true,
  },
  {
    name: 'updateDate',
    visible: false,
    disabled: false,
    filter: false,
    datatype: 'string',
    project: `{ "$dateToString": { "date": "$updateDate", "format": "%d/%m/%Y", "timezone": "-03:00" } }`,
    align: 'right',
    required: true,
  },
  {
    name: 'company.name',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'company.fantasyName',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'company.address',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'company.employee.name',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'employeeClosing.name',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'employeeClosing._id',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'updateUser._id',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'madein',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'state',
    visible: true,
    disabled: false,
    filter: false,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'observation',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'priceList.name',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'balance',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: `{"$toString" : "$balance"}`,
    align: 'right',
    required: false,
  },
  {
    name: 'totalPrice',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: `{"$toString" : "$totalPrice"}`,
    align: 'right',
    required: false,
  },
  {
    name: 'table.description',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'diners',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'number',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'orderNumber',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'number',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'transport.name',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'VATPeriod',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'cashBox.number',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'number',
    project: `{"$toString" : "$cashBox.number"}`,
    align: 'right',
    required: false,
  },
  {
    name: 'basePrice',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'exempt',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'discountAmount',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'discountPercent',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'percent',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'wooId',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'branchDestination.name',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'depositDestination.name',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'company.group.description',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'company.state.name',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'creationDate',
    visible: false,
    disabled: false,
    filter: false,
    datatype: 'date',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'updateDate',
    visible: false,
    disabled: false,
    filter: false,
    datatype: 'date',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'type.tax',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: `{"$toString" : "$type.tax"}`,
    align: 'left',
    required: false,
  },
  {
    name: 'type.transactionMovement',
    visible: false,
    disabled: false,
    filter: false,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'type.allowEdit',
    visible: false,
    disabled: false,
    filter: false,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'type.allowDelete',
    visible: false,
    disabled: false,
    filter: false,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'type.electronics',
    visible: false,
    disabled: false,
    filter: false,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'type.defectPrinter._id',
    visible: false,
    disabled: false,
    filter: false,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'type.defectPrinter.pageHigh',
    visible: false,
    disabled: false,
    filter: false,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'type.defectPrinter.pageWidth',
    visible: false,
    disabled: false,
    filter: false,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'type.defectPrinter.printIn',
    visible: false,
    disabled: false,
    filter: false,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'type.readLayout',
    visible: false,
    disabled: false,
    filter: false,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'company.emails',
    visible: false,
    disabled: false,
    filter: false,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'type.expirationDate',
    visible: false,
    disabled: false,
    filter: false,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'meliId',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'CAE',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'endDate2',
    visible: false,
    disabled: true,
    filter: false,
    datatype: 'date',
    project: `"$endDate"`,
    align: 'right',
    required: true,
  },
  {
    name: 'type.defectEmailTemplate._id',
    visible: false,
    disabled: false,
    filter: false,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'type.defectEmailTemplate.design',
    visible: false,
    disabled: false,
    filter: false,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'creationUser.name',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: '_id',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'operationType',
    visible: false,
    disabled: true,
    filter: false,
    datatype: 'string',
    defaultFilter: `{ "$ne": "D" }`,
    project: null,
    align: 'left',
    required: true,
  },
];
