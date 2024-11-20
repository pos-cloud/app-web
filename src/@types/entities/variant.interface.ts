import { Article } from "./article.interface";
import { VariantType } from "./variant-type.interface";
import { VariantValue } from "./variant-value.interface";

export interface Variant {
     _id: string;
	 type: VariantType;
	 value: VariantValue;
	 articleParent: Article;
	 articleChild: Article;
}