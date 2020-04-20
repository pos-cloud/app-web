import { VariantType } from "../variant-type/variant-type";

export class VariantValue {

	public _id: string;
	public type: VariantType;
	public order: number = 1;
	public description: string = '';

	constructor() { }
}