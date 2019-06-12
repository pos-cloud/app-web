import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { empty } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { VATCondition } from './../models/vat-condition';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class VATConditionService {

	constructor(
		public _http: Http,
		public _authService: AuthService
	) { }

	getLastVATCondition() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + 'vat-conditions/sort="code":-1&limit=1', { headers: headers }).map(res => res.json());
	}

	getVATCondition(id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "vat-condition/" + id, { headers: headers }).map(res => res.json());
	}

	getVATConditions() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + 'vat-conditions/sort="description":1', { headers: headers }).map(res => res.json());
	}

	saveVATCondition(vatCondition: VATCondition) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.post(Config.apiURL + "vat-condition", vatCondition, { headers: headers }).map(res => res.json());
	}

	saveVATConditions(vatConditions: VATCondition[]) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.post(Config.apiURL + "vat-condition", vatConditions, { headers: headers }).map(res => res.json());
	}

	deleteVATCondition(id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.delete(Config.apiURL + "vat-condition/" + id, { headers: headers }).map(res => res.json());
	}

	updateVATCondition(vatCondition: VATCondition) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.put(Config.apiURL + "vat-condition/" + vatCondition._id, vatCondition, { headers: headers }).map(res => res.json());
	}
}
