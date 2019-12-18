export class ArticleField {

	public _id: string;
	public order: number = 1;
	public name: string;
	public datatype: ArticleFieldType = ArticleFieldType.Percentage;
	public value: string;
  public modify: boolean = false;
  public modifyVAT: boolean = false;
  public discriminateVAT : boolean = false;

	constructor() { }
}

export enum ArticleFieldType {
    Percentage = <any> "Porcentaje",
    Number = <any> "Número",
    String = <any> "Alfabético",
    Array = <any> "Lista"
}
