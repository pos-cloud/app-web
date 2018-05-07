import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { TransactionType, TransactionMovement } from './../models/transaction-type';
import { Config } from './../app.config';
import { UserService } from './user.service';

@Injectable()
export class TransactionTypeService {

	constructor(
		public _http: Http,
		public _userService: UserService
	) { }

	getLastTransactionType() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'transactions/sort="_id":-1&limit=1', {headers: headers}).map(res => res.json());
	}

	getTransactionType(id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "transaction-type/" + id, {headers: headers}).map(res => res.json());
	}

	getTransactionTypes() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "transaction-types", {headers: headers}).map(res => res.json());
	}

	getTransactionTypesByMovement(transactionMovement: TransactionMovement) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'transaction-types/where="transactionMovement":"' + transactionMovement + '"', { headers: headers }).map(res => res.json());
	}
	
	getDefectOrder() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'transaction-types/where="defectOrders":' + true + '', { headers: headers }).map(res => res.json());
	}

	getTransactionByType(type: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'transaction-types/where="name":"' + type + '"', {headers: headers}).map(res => res.json());
	}

	getTransactionTypeByName(name: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'transaction-types/where="name":"' + name + '"', {headers: headers}).map(res => res.json());
	}

	saveTransactionType(transactionType: TransactionType) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.post(Config.apiURL + "transaction-type", transactionType, {headers: headers}).map(res => res.json());
	}

	deleteTransactionType(id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.delete(Config.apiURL + "transaction-type/" + id, {headers: headers}).map(res => res.json());
	}

	updateTransactionType(transactionType: TransactionType) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.put(Config.apiURL + "transaction-type/" + transactionType._id, transactionType, {headers: headers}).map(res => res.json());
	}
}