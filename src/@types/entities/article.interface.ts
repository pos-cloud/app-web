import {
  Account,
  Activity,
  Application,
  Category,
  Classification,
  Company,
  Currency,
  Deposit,
  Make,
  Taxes,
  UnitOfMeasurement,
  VariantType,
  VariantValue,
} from '@types';

export interface Article extends Activity {
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
  notes: string[];
  tags: string[];
  basePrice: number;
  taxes: Taxes[];
  costPrice: number;
  markupPercentage: number;
  markupPrice: number;
  salePrice: number;
  currency: Currency;
  make: Make;
  category: Category;
  deposits: {
    deposit: Deposit;
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
  provider: Company;
  applications: Application;
  classification: Classification;
  harticle: Article;
  salesAccount: Account;
  purchaseAccount: Account;
  minStock: number;
  maxStock: number;
  pointOfOrder: number;
  purchasePrice: number;
  costPrice2: number;
  season: string;
  m3: number;
  weight: number;
  width: number;
  height: number;
  depth: number;
  showMenu: boolean;
  updateVariants: boolean;
  tiendaNubeId: number;
  salePriceTN: number;
  variants: [
    {
      value: VariantValue;
      type: VariantType;
    }
  ];
  variantType1: VariantType;
  variantValue1: VariantValue;
  variantType2: VariantType;
  variantValue2: VariantValue;
  publishTiendaNube: boolean;
  publishWooCommerce: boolean;
}

export enum Type {
  Final = <any>'Final',
  Variant = <any>'Variante',
  Ingredient = <any>'Ingrediente',
}
