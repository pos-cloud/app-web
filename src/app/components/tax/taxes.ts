'use strict'

import { Tax } from 'app/components/tax/tax';


export class Taxes {

	public _id: string;
	public tax: Tax;
	public percentage: number = 0.00;
	public taxBase: number = 0.00;
	public taxAmount: number = 0.00;

	constructor() { }
}