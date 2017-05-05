export class User {
	
	public _id: string;
	public name: string;
	public password: string;
	public type: any = UserTypes.Supervisor;
	public status: any = UserStatus.Enabled;

	constructor () {}
}

export enum UserTypes {
	Supervisor = <any> "Supervisor",
	Waiter = <any> "Mozo",
}

export enum UserStatus {
	Enabled = <any> "Habilitado",
	Disabled = <any> "No Habilitado",
}