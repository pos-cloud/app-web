export class PaymentMethod {

	public _id: string;
	public name: string = '';
	public discount: number = 0.00;
	public surcharge: number = 0.00;
	public isCurrentAccount: boolean;
	public acceptReturned: boolean;
	public inputAndOuput: boolean;
	public checkDetail: boolean;
  public cardDetail: boolean;
  public allowToFinance: boolean;

	constructor () {}
}
