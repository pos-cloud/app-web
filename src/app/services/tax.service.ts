import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Tax } from './../models/tax';
import { Config } from './../app.config';
import { UserService } from './user.service';

@Injectable()
export class TaxService {

	constructor(
		public _http: Http,
		public _userService: UserService
	) { }

	getLastTax() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'taxes/sort="description":-1&limit=1', { headers: headers }).map(res => res.json());
	}

	getTax(id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "tax/" + id, { headers: headers }).map(res => res.json());
	}

	getTaxes() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "taxes", { headers: headers }).map(res => res.json());
	}

	saveTax(tax: Tax) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.post(Config.apiURL + "tax", tax, { headers: headers }).map(res => res.json());
	}

	deleteTax(id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.delete(Config.apiURL + "tax/" + id, { headers: headers }).map(res => res.json());
	}

	updateTax(tax: Tax) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.put(Config.apiURL + "tax/" + tax._id, tax, { headers: headers }).map(res => res.json());
	}
}
