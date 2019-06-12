import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { Tax } from './../models/tax';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class TaxService {

	constructor(
		public _http: Http,
		public _authService: AuthService
	) { }

	getTax(id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "tax/" + id, { headers: headers }).map(res => res.json());
	}

	getTaxes(query?: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		if (query) {
			return this._http.get(Config.apiURL + 'taxes/' + query, { headers: headers }).map(res => res.json());
		} else {
			return this._http.get(Config.apiURL + "taxes", { headers: headers }).map(res => res.json());
		}
	}

	saveTax(tax: Tax) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.post(Config.apiURL + "tax", tax, { headers: headers }).map(res => res.json());
	}

	deleteTax(id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.delete(Config.apiURL + "tax/" + id, { headers: headers }).map(res => res.json());
	}

	updateTax(tax: Tax) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.put(Config.apiURL + "tax/" + tax._id, tax, { headers: headers }).map(res => res.json());
	}
}
