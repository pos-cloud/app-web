import * as moment from 'moment';

import {Account} from '../account/account';
import {ArticleFields} from '../article-field/article-fields';
import {Article, ArticlePrintIn} from '../article/article';
import {Category} from '../category/category';
import {Deposit} from '../deposit/deposit';
import {Make} from '../make/make';
import {Taxes} from '../tax/taxes';
import {StockMovement} from '../transaction-type/transaction-type';
import {Transaction} from '../transaction/transaction';
import {User} from '../user/user';

export class MovementOfArticle {
  _id: string;
  code: string = '1';
  codeSAT: string;
  description: string = '';
  observation: string;
  basePrice: number = 0.0;
  otherFields: ArticleFields[];
  taxes: Taxes[];
  costPrice: number = 0.0;
  unitPrice: number = 0.0;
  markupPercentage: number = 0.0;
  markupPriceWithoutVAT: number = 0.0;
  markupPrice: number = 0.0;
  discountRate: number = 0.0;
  discountAmount: number = 0.0;
  transactionDiscountAmount: number = 0.0;
  salePrice: number = 0.0;
  roundingAmount: number = 0.0;
  quotation: number = 1;
  make: Make;
  category: Category;
  barcode: string;
  amount: number = 1;
  deposit: Deposit;
  quantityForStock: number = 0;
  notes: string;
  printIn: ArticlePrintIn;
  printed: number = 0;
  read: number = 0;
  status: MovementOfArticleStatus = MovementOfArticleStatus.Ready;
  article: Article;
  transaction: Transaction = null;
  measure: string;
  quantityMeasure: number = 1;
  modifyStock: boolean;
  stockMovement: StockMovement;
  movementParent: MovementOfArticle;
  movementOrigin: MovementOfArticle;
  isOptional: boolean = false;
  isGeneratedByPayment: boolean = false;
  account: Account;
  op: number;
  creationUser: User;
  creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  updateUser: User;
  updateDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');

  constructor() {}
}

export enum MovementOfArticleStatus {
  Pending = <any>'Pendiente',
  Preparing = <any>'Preparando',
  LastOrder = <any>'Última Orden',
  Ready = <any>'Listo',
}

export let attributes = [
  {
    name: 'transaction.endDate',
    visible: true,
    disabled: true,
    filter: true,
    datatype: 'string',
    project: `{ "$dateToString": { "date": "$transaction.endDate", "format": "%d/%m/%Y", "timezone": "-03:00" } }`,
    align: 'left',
    required: true,
  },
  {
    name: 'transaction.type.name',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'center',
    required: false,
  },
  {
    name: 'transaction.origin',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'number',
    project: null,
    align: 'center',
    required: false,
  },
  {
    name: 'transaction.letter',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'center',
    required: false,
  },
  {
    name: 'transaction.number',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'number',
    project: null,
    align: 'center',
    required: false,
  },
  {
    name: 'transaction.company.name',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'center',
    required: false,
  },
  {
    name: 'transaction.company.state.name',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'center',
    required: false,
  },
  {
    name: 'transaction.company.city',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'center',
    required: false,
  },
  {
    name: 'transaction.employeeClosing.name',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'center',
    required: false,
  },
  {
    name: 'code',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'article.barcode',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'description',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'category._id',
    visible: false,
    disabled: true,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'category.description',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'article.posDescription',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'notes',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'observation',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'make.description',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'article.providers.name',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: `{"$reduce":{"input":"$article.providers.name","initialValue":"","in":{"$concat":["$$value",{"$cond":{"if":{"$eq":["$$value",""]},"then":"","else":"; "}},{"$concat":[{"$toString":"$$this"},"-"]}]}}}`,
    align: 'left',
    required: false,
  },
  {
    name: 'article.provider.name',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: `{"$reduce":{"input":"$article.provider.name","initialValue":"","in":{"$concat":["$$value",{"$cond":{"if":{"$eq":["$$value",""]},"then":"","else":"; "}},{"$concat":[{"$toString":"$$this"},"-"]}]}}}`,
    align: 'left',
    required: false,
  },
  {
    name: 'otherFieldsValues',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: `{"$reduce":{"input":"$article.otherFields.value","initialValue":"","in":{"$concat":["$$value",{"$cond":{"if":{"$eq":["$$value",""]},"then":"","else":"; "}},{"$concat":[{"$toString":"$$this"},""]}]}}}`,
    align: 'left',
    required: false,
  },
  {
    name: 'amount',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'number',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'discountRate',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'percent',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'basePrice',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'costPrice',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'unitPrice',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'markupPercentage',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'percent',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'markupPriceWithoutVAT',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'markupPrice',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'taxes',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required: true,
  },
  {
    name: 'salePrice',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'deposit.name',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'deposit.branch.name',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'article.basePrice',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'article.costPrice',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'article.salePrice',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'article.containsStructure',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: `{ "$toString" : "$article.containsStructure"}`,
    align: 'left',
    required: false,
  },
  {
    name: 'quantityForStock',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'number',
    project: null,
    align: 'right',
    required: false,
  },
  {
    name: 'creationDate',
    visible: false,
    disabled: false,
    filter: false,
    datatype: 'date',
    defaultFilter: null,
    project: null,
    align: 'left',
    required: false,
  },
  {
    name: 'updateDate',
    visible: false,
    disabled: false,
    filter: false,
    datatype: 'date',
    defaultFilter: null,
    project: null,
    align: 'left',
    required: false,
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
    required: true,
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
    required: true,
  },
  {
    name: 'transaction.type.transactionMovement',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'transaction.type._id',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'transaction.creationDate',
    visible: false,
    disabled: false,
    filter: false,
    datatype: 'date',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'transaction.updateDate',
    visible: false,
    disabled: false,
    filter: false,
    datatype: 'date',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'endDate2',
    visible: false,
    disabled: true,
    filter: false,
    datatype: 'date',
    project: `"$transaction.endDate"`,
    align: 'right',
    required: true,
  },
  {
    name: 'transaction.state',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },

  {
    name: 'transaction._id',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'article._id',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },
  {
    name: 'transaction.branchDestination._id',
    visible: false,
    disabled: true,
    filter: true,
    defaultFilter: null,
    datatype: 'string',
    project: null,
    align: 'left',
    required: true,
  },
];
