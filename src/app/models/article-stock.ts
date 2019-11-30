import { Article } from './article';
import { Deposit } from './deposit';
import { Branch } from './branch';

export class ArticleStock {

	public _id: string;
	public article: Article;
	public branch: Branch;
	public deposit: Deposit;
	public realStock: number = 0.00;
	public minStock: number = 0.00;
	public maxStock: number = 0.00;

	constructor() { }
}

export let attributes = [
	{
		name: 'branch.name',
		visible: true,
		disabled: false,
		filter: true,
		datatype: 'string',
		align: 'left',
		required : false,
	},
	{
		name: 'branch.number',
		visible: true,
		disabled: false,
		filter: true,
		datatype: 'string',
		align: 'left',
		required : false,
	},
	{
		name: 'deposit.name',
		visible: true,
		disabled: false,
		filter: true,
		datatype: 'string',
		align: 'left',
		required : false,
	},
	{
		name: 'article.code',
		visible: true,
		disabled: false,
		filter: true,
		datatype: 'string',
		align: 'left',
		required : false,
	},
	{
		name: 'article.barcode',
		visible: true,
		disabled: false,
		filter: true,
		datatype: 'string',
		align: 'left',
		required : false,
	},
	{
		name: 'article.description',
		visible: true,
		disabled: false,
		filter: true,
		datatype: 'string',
		align: 'left',
		required : false,
	},
	{
		name: 'article.posDescription',
		visible: true,
		disabled: false,
		filter: true,
		datatype: 'string',
		align: 'left',
		required : false,
	},
	{
		name: 'article.category.description',
		visible: true,
		disabled: false,
		filter: true,
		datatype: 'string',
		align: 'left',
		required : false,
	},
	{
		name: 'article.make.description',
		visible: true,
		disabled: false,
		filter: true,
		datatype: 'string',
		align: 'left',
		required : false,
	},
]