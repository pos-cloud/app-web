import { Activity } from '@types';
import { Category } from './category.interface';
import { Classification } from './classification.interface';
import { Make } from './make.interface';
import { UnitOfMeasurement } from './unit-of-measurement.interface';
import { User } from './user.interface';
import { VariantType } from './variant-type.interface';
import { VariantValue } from './variant-value.interface';

export interface Article extends Activity {
  creationDate: string;
  creationUser: User;
  type: string;
  order: number;
  containsVariants: boolean;
  containsStructure: boolean;
  code: string;
  codeProvider: string;
  codeSAT: string;
  description: string;
  url: string;
  posDescription: string;
  quantityPerMeasure: string;
  unitOfMeasurement: UnitOfMeasurement;
  observation: string;
  notes: [];
  tags: [];
  basePrice: number;
  taxes: any; //Taxes[];
  costPrice: number;
  markupPercentage: number;
  markupPrice: number;
  salePrice: number;
  currency: any; //Currency;
  make: Make;
  category: Category;
  deposits: {
    deposit: any; //Deposit;
    capacity: number;
  }[];
  locations: {
    location: Location;
  }[];
  children: {
    article: Article;
    quantity: number;
  }[];
  pictures: {
    wooId?: string;
    meliId?: string;
    picture: string;
  }[];
  barcode: string;
  wooId: string;
  meliId: string;
  printIn: string;
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
  provider: any; //Company;
  applications: any; //Application;
  classification: Classification;
  harticle: Article;
  salesAccount: any; //Account;
  purchaseAccount: any; //Account;
  minStock: number;
  maxStock: number;
  pointOfOrder: number;
  purchasePrice: number;
  costPrice2: number;
  m3: number;
  weight: number;
  width: number;
  height: number;
  depth: number;
  showMenu: boolean;
  updateVariants: boolean;
  tiendaNubeId: number;
  salePriceTN: number;
  variants: {
    value: VariantValue;
    type: VariantType;
  };
  variantType1: VariantType;
  variantValue1: VariantValue;
  variantType2: VariantType;
  variantValue2: VariantValue;
}

export enum Type {
  Final = <any>'Final',
  Variant = <any>'Variante',
  Ingredient = <any>'Ingrediente',
}
