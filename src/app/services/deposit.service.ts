import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { empty } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Deposit } from './../models/deposit';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class DepositService {

	constructor(
		public _http: Http,
		public _authService: AuthService
	) { }

	getLastDeposit() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + 'deposits/sort="description":-1&limit=1', { headers: headers }).map(res => res.json());
	}

	getDeposit(id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "deposit/" + id, { headers: headers }).map(res => res.json());
	}

	getDeposits(query?: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		if (query) {
			return this._http.get(Config.apiURL + 'deposits/' + query, { headers: headers }).map(res => res.json());
		} else {
			return this._http.get(Config.apiURL + "deposits", { headers: headers }).map(res => res.json());
		}
	}

	saveDeposit(deposit: Deposit) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.post(Config.apiURL + "deposit", deposit, { headers: headers }).map(res => res.json());
	}

	deleteDeposit(id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.delete(Config.apiURL + "deposit/" + id, { headers: headers }).map(res => res.json());
	}

	updateDeposit(deposit: Deposit) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.put(Config.apiURL + "deposit/" + deposit._id, deposit, { headers: headers }).map(res => res.json());
	}
}
