export class Category {

  public _id: string;
  public order: number = 1;
	public description: string = '';
	public picture: string;
  public visibleInvoice: boolean = false;
  public ecommerceEnabled: boolean = false;

	constructor () {}
}
