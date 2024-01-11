import * as moment from 'moment';
import { PaymentMethod } from '../payment-method/payment-method';
import { Transaction } from '../transaction/transaction';
import { Bank } from '../bank/bank';

export interface currencyValue {
    value: number;
    quantity: number;
}

export class MovementOfCash {

    _id: string;
    date: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    quota: number = 1;
    expirationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    discount: number = 0.00;
    surcharge: number = 0.00;
    commissionAmount: number = 0.00;
    administrativeExpenseAmount: number = 0.00;
    otherExpenseAmount: number = 0.00;
    statusCheck: StatusCheck = null;
    capital: number = 0.00;
    interestPercentage: number = 0.00;
    interestAmount: number = 0.00;
    taxPercentage: number = 0.00;
    taxAmount: number = 0.00;
    amountPaid: number = 0.00;
    amountDiscount: number = 0.00;
    observation: string;
    type: PaymentMethod;
    transaction: Transaction;
    receiver: string;
    number: string;
    bank: Bank;
    titular: string;
    CUIT: string;
    deliveredBy: string;
    paymentChange: number = 0.00;
    balanceCanceled: number = 0.00;
    cancelingTransaction: Transaction;
    currencyValues: currencyValue[]
    operationType: string;
    paymentStatus: PaymentStatus

    constructor() { }
}

export enum StatusCheck {
    Rejected = <any>"Rechazado",
    Closed = <any>"Cerrado",
    Deposit = <any>"Depositado",
    Available = <any>"Disponible"
}

export enum PaymentStatus {
    Authorized = <any> 'Autorizado',
    Pending = <any> 'Pendiente',
    Paid = <any> 'Pagado',
    Abandoned = <any> 'Abandonado',
    Refunded = <any> 'Reembolso',
    Voided = <any>'Anulado'
  }

export let attributes = [
    {
        name: 'transaction.endDate',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'date',
        project: `{ "$dateToString": { "date": "$transaction.endDate", "format": "%d/%m/%Y", "timezone": "-03:00" } }`,
        align: 'left',
        required: true,
    },
    {
        name: 'transaction.cashBox.number',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'number',
        project: null,
        align: 'left',
        required: false,
    },
    {
        name: 'transaction.type.name',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
    },
    {
        name: 'transaction.company.identificationValue',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
    },
    {
        name: 'type._id',
        visible: false,
        disabled: true,
        filter: false,
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
        name: 'quota',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'number',
        project: null,
        align: 'left',
        required: false,
    },
    {
        name: 'amountPaid',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'currency',
        project: null,
        align: 'right',
        required: false,
    },
    {
        name: 'discount',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'currency',
        project: null,
        align: 'right',
        required: false,
    },
    {
        name: 'number',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
    },
    {
        name: 'bank.name',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
    },
    {
        name: 'expirationDate',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'date',
        project: `{ "$dateToString": { "date": "$expirationDate", "format": "%d/%m/%Y", "timezone": "-03:00" } }`,
        align: 'left',
        required: false,
    },
    {
        name: 'expirationDate2',
        visible: false,
        disabled: true,
        filter: false,
        datatype: 'date',
        project: `"$expirationDate"`,
        align: 'left',
        required: true,
    },
    {
        name: 'statusCheck',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
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
        name: 'transaction.observation',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
    },
    {
        name: 'interestAmount',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'currency',
        project: null,
        align: 'left',
        required: false,
    },
    {
        name: 'balanceCanceled',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'currency',
        project: null,
        align: 'left',
        required: false,
    },
    {
        name: 'transaction.company.name',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
    },
    {
        name: 'deliveredBy',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
    },
    {
        name: 'CUIT',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
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
        name: 'transaction.operationType',
        visible: false,
        disabled: true,
        filter: true,
        defaultFilter: `{ "$ne": "D" }`,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
    },
    {
        name: 'transaction.type.transactionMovement',
        visible: false,
        disabled: true,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
    },
    {
        name: 'transaction._id',
        visible: false,
        disabled: true,
        filter: true,
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
        project: `"$transaction.endDate"`,
        align: 'right',
        required: true,
    },
    {
        name: 'transaction.creationDate',
        visible: false,
        disabled: false,
        filter: false,
        datatype: 'date',
        project: null,
        align: 'left',
        required: true,
    },
    {
        name: 'transaction.updateDate',
        visible: false,
        disabled: false,
        filter: false,
        datatype: 'date',
        project: null,
        align: 'left',
        required: true,
    },
    {
        name: 'transaction.state',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
    },
    {
        name: 'transaction.branchDestination._id',
        visible: false,
        disabled: true,
        filter: true,
        defaultFilter: null,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
    },
    {
        name: 'transaction.type._id',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
    }
];
