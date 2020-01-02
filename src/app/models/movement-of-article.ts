import { Article, ArticlePrintIn } from './article';
import { Transaction } from './transaction';
import { Make } from './make';
import { Category } from './category';
import { Taxes } from './taxes';
import { ArticleFields } from './article-fields';
import { Deposit } from './deposit';

export class MovementOfArticle {

  public _id: string;
  public code: string = "1";
  public codeSAT: string;
  public description: string = '';
  public observation: string;
  public basePrice: number = 0.00;
  public otherFields: ArticleFields[];
  public taxes: Taxes[];
  public costPrice: number = 0.00;
  public unitPrice: number = 0.00;
  public markupPercentage: number = 0.00;
  public markupPrice: number = 0.00;
  public transactionDiscountAmount: number = 0.00;
  public salePrice: number = 0.00;
  public roundingAmount: number = 0.00;
  public quotation: number = 1;
  public make: Make;
  public category: Category;
  public barcode: string;
  public amount: number = 1;
  public deposit: Deposit;
  public quantityForStock: number = 0;
  public notes: string;
  public printIn: ArticlePrintIn;
  public printed: number = 0;
  public status: MovementOfArticleStatus = MovementOfArticleStatus.Ready;
  public article: Article;
  public transaction: Transaction = null;
  public measure: string ;
  public quantityMeasure : number = 1;
  public modifyStock : boolean;
  public stockMovement: string;
  public movementParent : string;

	constructor () {}
}

export enum MovementOfArticleStatus {
	Pending = <any> "Pendiente",
	Preparing = <any> "Preparando",
	LastOrder = <any> "Última Orden",
	Ready = <any> "Listo",
}

export let attributes = [
  {
    name: 'description',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required : false,
  },
  {
    name: 'amount',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'number',
    project: null,
    align: 'right',
    required : false,
  },
  {
    name: 'basePrice',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required : false,
  },
  {
    name: 'costPrice',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required : false,
  },
  {
    name: 'unitPrice',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required : false,
  },
  {
    name: 'markupPercentage',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'percent',
    project: null,
    align: 'right',
    required : false,
  },
  {
    name: 'markupPrice',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required : false,
  },
  {
    name: 'salePrice',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required : false,
  },
  {
    name: 'operationType',
    visible: false,
    disabled: true,
    filter: false,
    datatype: 'string',
    defaultFilter: `{ "$ne": "D" }`,
    project: null,
    align: 'left',
    required : true,
  },
  {
    name: 'transaction.operationType',
    visible: false,
    disabled: true,
    filter: true,
    defaultFilter: `{ "$ne": "D" }`,
    datatype: 'string',
    project: null,
    align: 'left',
    required : true,
  },
  {
    name: 'transaction.endDate',
    visible: true,
    disabled: true,
    filter: true,
    datatype: 'date',
    project: null,
    align: 'left',
    required : true
  },
  {
    name: 'transaction.type.transactionMovement',
    visible: false,
    disabled: true,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required : true,
  },
  {
    name: 'transaction._id',
    visible: false,
    disabled: true,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required : true,
  },
  {
    name: 'article._id',
    visible: false,
    disabled: true,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required : true,
  }
];