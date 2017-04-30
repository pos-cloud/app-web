export class Waiter {
	
	public _id: string;
	private code: number;
	private name: string;
	
	constructor () {}

	public setCode(code: number): void {
        this.code = code;
    }
}