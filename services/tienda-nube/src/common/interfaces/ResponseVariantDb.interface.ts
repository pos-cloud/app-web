export interface ResponseVariantsDB {
  variants: Variant[];
  articleChildInfo: ArticleChildInfo;
  articleParent: string;
  articleChild: string;
}

export interface ArticleChildInfo {
  _id: string;
  order: number;
  type: string;
  containsVariants: boolean;
  containsStructure: boolean;
  quantityPerMeasure: number;
  notes: any[];
  tags: any[];
  basePrice: number;
  costPrice: number;
  markupPercentage: number;
  markupPrice: number;
  salePrice: number;
  purchasePrice: number;
  posKitchen: boolean;
  allowPurchase: boolean;
  allowSale: boolean;
  allowStock: boolean;
  allowSaleWithoutStock: boolean;
  allowMeasure: boolean;
  ecommerceEnabled: boolean;
  favourite: boolean;
  isWeigth: boolean;
  forShipping: boolean;
  picture: string;
  providers: any[];
  applications: any[];
  otherFields: any[];
  taxes: any[];
  deposits: any[];
  locations: any[];
  children: any[];
  pictures: any[];
  description: string;
  code: string;
  codeSAT: string;
  posDescription: string;
  unitOfMeasurement: null;
  observation: string;
  currency: null;
  make: null;
  category: string;
  barcode: string;
  printIn: string;
  salesAccount: null;
  purchaseAccount: null;
  meliId: null;
  creationUser: string;
  creationDate: Date | string;
  operationType: string;
  __v: number;
}

export interface Variant {
  type: Type;
  value: Value;
  creationUser: string;
  creationDate: Date | string;
  operationType: string;
  __v: number;
}

export interface Type {
  _id: string;
  order?: number;
  name: string;
  meliId?: null;
  creationUser: string;
  creationDate: Date | string;
  operationType: string;
  __v: number;
}

export interface Value {
  _id: string;
  order?: number;
  picture?: null;
  creationDate: Date | string;
  updateDate?: Date | string;
  description: string;
  type: string;
  audits?: Audit[];
  creationUser: string;
  operationType: string;
  updateUser?: string;
  __v: number;
}

export interface Audit {
  _id: string;
  date: Date;
  user: string;
}
