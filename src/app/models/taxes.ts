'use strict'

import { Tax } from './tax';

export class Taxes {

	public tax: Tax;
	public percentage: number = 0.00;
	public taxBase: number = 0.00;
	public taxAmount: number = 0.00;

	constructor() { }
}