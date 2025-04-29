import { Account, Activity, Printer } from '@types';

export interface Tax extends Activity {
  _id: string;
  code: string;
  name: string;
  taxBase: TaxBase;
  percentage: number;
  amount: number;
  classification: TaxClassification;
  type: TaxType;
  lastNumber: number;
  debitAccount: Account;
  creditAccount: Account;
  printer: Printer;
}

export interface Taxes {
  _id: string;
  tax: Tax;
  percentage: number;
  taxBase: number;
  taxAmount: number;
}

export enum TaxBase {
  None = '',
  Neto = 'Gravado',
}

export enum TaxClassification {
  None = '',
  Tax = 'Impuesto',
  Withholding = 'Retención',
  Perception = 'Percepción',
}

export enum TaxType {
  None = '',
  National = 'Nacional',
  State = 'Provincial',
  City = 'Municipal',
}
