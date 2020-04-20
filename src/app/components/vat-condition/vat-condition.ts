export class VATCondition {

	public _id: string;
	public code: number;
	public description: string;
	public discriminate: boolean = false;
	public transactionLetter: string;

	constructor() { }
}
