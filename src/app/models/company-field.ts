export class CompanyField {

	public _id: string;
	public name: string;
	public datatype: CompanyFieldType;
	public value: string;
  public modify: boolean = false;
  public modifyVAT: boolean = false;

	constructor() { }
}

export enum CompanyFieldType {
    Number = <any> "Número",
    String = <any> "Alfabético"
}
