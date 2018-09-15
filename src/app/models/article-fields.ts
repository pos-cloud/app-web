'use strict'

import { ArticleField, ArticleFieldType } from './article-field';

export class ArticleFields {

	public articleField: ArticleField;
	public name: string = "";
	public datatype: ArticleFieldType = ArticleFieldType.Percentage;
	public value: string = "";
	public amount: number = 0;

	constructor() { }
}