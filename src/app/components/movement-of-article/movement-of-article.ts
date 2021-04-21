import { Article, ArticlePrintIn } from '../article/article';
import { Transaction } from '../transaction/transaction';
import { Make } from '../make/make';
import { Category } from '../category/category';
import { Taxes } from '../tax/taxes';
import { ArticleFields } from '../article-field/article-fields';
import { Deposit } from '../deposit/deposit';
import * as moment from 'moment';
import { User } from '../user/user';

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
    public markupPriceWithoutVAT: number = 0.00;
    public markupPrice: number = 0.00;
	public discountRate: number = 0.00;
	public discountAmount: number = 0.00;
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
    public measure: string;
    public quantityMeasure: number = 1;
    public modifyStock: boolean;
    public stockMovement: string;
    public movementParent: MovementOfArticle;
    public isOptional: boolean = false;
    public isGeneratedByPayment: boolean = false;
    public account : Account;
    public creationUser: User;
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public updateUser: User;
    public updateDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');

    constructor() { }
}

export enum MovementOfArticleStatus {
    Pending = <any>"Pendiente",
    Preparing = <any>"Preparando",
    LastOrder = <any>"Última Orden",
    Ready = <any>"Listo",
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
        required: true
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
    }
];
