import { PaymentMethod } from '../payment-method/payment-method';
import { Transaction } from '../transaction/transaction';
import { Bank } from '../bank/bank';

import * as moment from 'moment';

export interface currencyValue {
    value: number;
    quantity: number;
}

export class MovementOfCash {

    public _id: string;
    public date: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public quota: number = 1;
    public expirationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public discount: number = 0.00;
    public surcharge: number = 0.00;
    public commissionAmount: number = 0.00;
    public administrativeExpenseAmount: number = 0.00;
    public otherExpenseAmount: number = 0.00;
    public statusCheck: StatusCheck = null;
    public capital: number = 0.00;
    public interestPercentage: number = 0.00;
    public interestAmount: number = 0.00;
    public taxPercentage: number = 0.00;
    public taxAmount: number = 0.00;
    public amountPaid: number = 0.00;
    public observation: string;
    public type: PaymentMethod;
    public transaction: Transaction;
    public receiver: string;
    public number: string;
    public bank: Bank;
    public titular: string;
    public CUIT: string;
    public deliveredBy: string;
    public paymentChange: number = 0.00;
    public balanceCanceled: number = 0.00;
    public cancelingTransaction: Transaction;
    public currencyValues: currencyValue[]

    constructor() { }
}

export enum StatusCheck {
    Rejected = <any>"Rechazado",
    Closed = <any>"Cerrado",
    Deposit = <any>"Depositado",
    Available = <any>"Disponible"
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
