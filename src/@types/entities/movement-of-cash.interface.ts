import { Activity, Bank } from '@types';

export interface MovementOfCash extends Activity {
  _id: string;
  date: string;
  quota: number;
  expirationDate: string;
  discount: number;
  surcharge: number;
  commissionAmount: number;
  administrativeExpenseAmount: number;
  otherExpenseAmount: number;
  statusCheck: StatusCheck;
  capital: number;
  interestPercentage: number;
  interestAmount: number;
  taxPercentage: number;
  taxAmount: number;
  amountPaid: number;
  amountDiscount: number;
  observation: string;
  type: any; // PaymentMethod;
  transaction: any; //Transaction;
  receiver: string;
  number: string;
  bank: Bank;
  titular: string;
  CUIT: string;
  deliveredBy: string;
  paymentChange: number;
  balanceCanceled: number;
  cancelingTransaction: any; //Transaction;
  currencyValues: any; //currencyValue[];
  operationType: string;
  status: PaymentStatus;
}

export enum StatusCheck {
  Rejected = <any>'Rechazado',
  Closed = <any>'Cerrado',
  Deposit = <any>'Depositado',
  Available = <any>'Disponible',
}

export enum PaymentStatus {
  Authorized = <any>'Autorizado',
  Pending = <any>'Pendiente',
  Paid = <any>'Pagado',
  Abandoned = <any>'Abandonado',
  Refunded = <any>'Reembolso',
  Voided = <any>'Anulado',
}
