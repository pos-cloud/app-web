export class ArticleField {

	public _id: string;
	public name: string;
	public type: ArticleFieldType = ArticleFieldType.Percentage;
	public value: string;
	public modify: boolean = false;

	constructor() { }
}

export enum ArticleFieldType {
    Percentage = <any> "Porcentaje",
    Number = <any> "Número",
    String = <any> "Alfabético"
}