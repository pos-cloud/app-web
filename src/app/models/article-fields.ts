'use strict'

import { ArticleField, ArticleFieldType } from './article-field';

export class ArticleFields {

	public articleField: ArticleField;
	public name: string = "";
	public type: ArticleFieldType = ArticleFieldType.Percentage;
	public value: string = "";

	constructor() { }
}