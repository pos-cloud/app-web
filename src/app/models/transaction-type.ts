export class TransactionType {

	public _id: string;
	public name: string;
	public state: TransactionTypeState = TransactionTypeState.Enabled;
	public currentAccount: CurrentAcount = CurrentAcount.No;
	public movement: TypeOfMovements = TypeOfMovements.Inflows;

	constructor() { }
}

export enum TransactionTypeState {
	Enabled = <any> "Habilitado",
	Disabled = <any> "Deshabilitado"
}

export enum TypeOfMovements {
	Inflows = <any> "Entrada",
	Outflows = <any> "Salida"
}

export enum CurrentAcount {
	Yes = <any>"Sí",
	No = <any>"No"
}