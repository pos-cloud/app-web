import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { empty } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { TransactionType, TransactionMovement } from './../models/transaction-type';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class TransactionTypeService {

	constructor(
		public _http: Http,
		public _authService: AuthService
	) { }

	getLastTransactionType() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + 'transactions/sort="_id":-1&limit=1', {headers: headers}).map(res => res.json());
	}

	getTransactionType(id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "transaction-type/" + id, {headers: headers}).map(res => res.json());
	}

	getTransactionTypes(query?: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});

		if (query) {
			return this._http.get(Config.apiURL + "transaction-types/" + query, {headers: headers}).map(res => res.json());
		} else {
			return this._http.get(Config.apiURL + "transaction-types", { headers: headers }).map(res => res.json());
		}
	}

	getTransactionTypesByMovement(transactionMovement: TransactionMovement) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + 'transaction-types/where="transactionMovement":"' + transactionMovement + '"', { headers: headers }).map(res => res.json());
  }

  getTransactionTypesOfCashBox() {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.get(Config.apiURL + 'transaction-types/where="$or":[{"cashOpening":true},{"cashClosing":true}]', { headers: headers }).map(res => res.json());
  }

	getDefectOrder() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + 'transaction-types/where="defectOrders":' + true + '', { headers: headers }).map(res => res.json());
	}

	getTransactionByType(type: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + 'transaction-types/where="name":"' + type + '"', {headers: headers}).map(res => res.json());
	}

	getTransactionTypeByName(name: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + 'transaction-types/where="name":"' + name + '"', {headers: headers}).map(res => res.json());
	}

	saveTransactionType(transactionType: TransactionType) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.post(Config.apiURL + "transaction-type", transactionType, {headers: headers}).map(res => res.json());
	}

	deleteTransactionType(id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.delete(Config.apiURL + "transaction-type/" + id, {headers: headers}).map(res => res.json());
	}

	updateTransactionType(transactionType: TransactionType) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.put(Config.apiURL + "transaction-type/" + transactionType._id, transactionType, {headers: headers}).map(res => res.json());
	}
}
