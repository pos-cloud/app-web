'use strict'

import { Account } from "../account/account";

export class Tax {

	public _id: string;
	public code: string = '0';
	public name: string;
	public taxBase: TaxBase = TaxBase.None;
	public percentage: number = 0;
	public amount: number = 0;
	public classification: TaxClassification = TaxClassification.None;
	public type: TaxType = TaxType.None;
	public lastNumber: number = 0;
    public debitAccount : Account;
    public creditAccount : Account;

	constructor() { }
}

export enum TaxBase {
	None = <any> "",
	Neto = <any> "Gravado",
}

export enum TaxClassification {
	None = <any> "",
	Tax = <any> "Impuesto",
	Withholding = <any> "Retención",
	Perception = <any> "Percepción",
}

export enum TaxType {
	None = <any> "",
	National = <any> "Nacional",
	State = <any> "Provincial",
	City = <any> "Municipal",
}