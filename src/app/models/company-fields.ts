'use strict'

import { CompanyField, CompanyFieldType } from './company-field';

export class CompanyFields {

	public companyField: CompanyField;
	public name: string = "";
	public datatype: CompanyFieldType ;
	public value: string = "";
	
	constructor() { }
}