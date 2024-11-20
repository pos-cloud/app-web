import { VariantType } from "./variant-type.interface";

export interface VariantValue{
     _id: string;
	 type: VariantType;
	 order: number;
	 description: string;
}