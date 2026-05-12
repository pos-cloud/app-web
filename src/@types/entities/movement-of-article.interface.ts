import {
  Account,
  Activity,
  Article,
  Category,
  Deposit,
  Make,
  PrintType,
  StockMovement,
  Taxes,
  Transaction,
} from '@types';

export interface MovementOfArticle extends Activity {
  _id: string;
  code: string;
  codeSAT: string;
  description: string;
  observation: string;
  basePrice: number;
  taxes: Taxes[];
  costPrice: number;
  unitPrice: number;
  markupPercentage: number;
  markupPriceWithoutVAT: number;
  markupPrice: number;
  discountRate: number;
  discountAmount: number;
  transactionDiscountAmount: number;
  salePrice: number;
  roundingAmount: number;
  quotation: number;
  make: Make;
  category: Category;
  barcode: string;
  amount: number;
  deposit: Deposit;
  quantityForStock: number;
  notes: string;
  printIn: PrintType;
  printed: number;
  read: number;
  status: MovementOfArticleStatus;
  article: Article;
  transaction: Transaction;
  measure: string;
  quantityMeasure: number;
  modifyStock: boolean;
  stockMovement: StockMovement;
  movementParent: MovementOfArticle;
  movementOrigin: MovementOfArticle;
  isOptional: boolean;
  isGeneratedByPayment: boolean;
  account: Account;
  op: number;
}

export enum MovementOfArticleStatus {
  Pending = <any>'Pendiente',
  Preparing = <any>'Preparando',
  LastOrder = <any>'Última Orden',
  Ready = <any>'Listo',
}
