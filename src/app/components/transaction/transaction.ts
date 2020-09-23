import { Company } from '../company/company';
import { CashBox } from '../cash-box/cash-box';
import { Table } from '../table/table';
import { TransactionType } from '../transaction-type/transaction-type';
import { Taxes } from '../tax/taxes';
import { User } from '../user/user';

import * as moment from 'moment';
import { UseOfCFDI } from '../use-of-CFDI.component.ts/use-of-CFDI';
import { RelationType } from '../relation-type/relation-type';
import { Currency } from '../currency/currency';
import { Branch } from '../branch/branch';
import { Deposit } from '../deposit/deposit';
import { Transport } from '../transport/transport';
import { PriceList } from '../price-list/price-list';
import { Employee } from 'app/components/employee/employee';
import { Address } from '../address/address.model';
import { ShipmentMethod } from '../shipment-method/shipment-method.model';

export class Transaction {

  public _id: string;
  public origin: number = 0;
  public letter: string = '';
  public number: number = 0;
  public startDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  public endDate: string;
  public expirationDate: string;
  public VATPeriod: string = moment().format('YYYYMM');
  public state: TransactionState = TransactionState.Open;
  public basePrice: number = 0.00;
  public exempt: number = 0.00;
  public taxes: Taxes[];
  public discountAmount: number = 0.00;
  public discountPercent: number = 0.00;
  public commissionAmount: number = 0.00;
  public totalPrice: number = 0.00;
  public roundingAmount: number = 0.00;
  public diners: number = 0;
  public orderNumber: number = 0;
  public observation: string;
  public madein: string;
  public balance: number = 0.00;
  public CAE: string; // AR
  public CAEExpirationDate: string; // AR
  public relationType: RelationType; // MX
  public useOfCFDI: UseOfCFDI; // MX
  public stringSAT: string; // MX
  public CFDStamp: string; // MX
  public SATStamp: string; // MX
  public UUID: string; // MX
  public type: TransactionType;
  public company: Company;
  public cashBox: CashBox;
  public currency: Currency;
  public quotation: number;
  public printed: number;
  public table: Table;
  public employeeOpening: Employee;
  public employeeClosing: Employee;
  public deliveryAddress: Address;
  public branchOrigin: Branch;
  public branchDestination: Branch;
  public depositOrigin: Deposit;
  public depositDestination: Deposit;
  public transport: Transport;
  public shipmentMethod: ShipmentMethod;
  public priceList: PriceList;
  public creationUser: User;
  public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  public updateUser: User;
  public updateDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');

  constructor() { }
}

export enum TransactionState {
  Open = <any>"Abierto",
  Outstanding = <any>"Pendiente de pago",
  PaymentConfirmed = <any>"Pago Confirmado",
  PaymentDeclined = <any>"Pago Rechazado",
  Canceled = <any>"Anulado",
  Packing = <any>"Armando",
  Closed = <any>"Cerrado",
  Delivered = <any>"Entregado",
  Sent = <any>"Enviado",
  Preparing = <any>"Preparando",
  Pending = <any>"Pendiente",
}

export let attributes = [
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
    visible: true,
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
    name: '_id',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  }
];

