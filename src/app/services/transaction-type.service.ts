import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { TransactionType } from './../models/transaction-type';
import { Config } from './../app.config';

@Injectable()
export class TransactionTypeService {

	constructor(public _http: Http) { }

	getLastTransactionType() {
		return this._http.get(Config.apiURL + 'transactions/sort="_id":-1&limit=1').map(res => res.json());
	}

	getTransactionType(id) {
		return this._http.get(Config.apiURL + "transaction-type/" + id).map(res => res.json());
	}

	getTransactionTypes() {
		return this._http.get(Config.apiURL + "transaction-types").map(res => res.json());
	}

	getTransactionTypeSaleOrder() {
		return this._http.get(Config.apiURL + 'transaction-types/where="name":"Orden de Pedido"').map(res => res.json());
	}

	getTransactionTypeCharge() {
		return this._http.get(Config.apiURL + 'transaction-types/where="name":"Cobro"').map(res => res.json());
	}

	saveTransactionType(transactionType: TransactionType) {
		return this._http.post(Config.apiURL + "transaction-type", transactionType).map(res => res.json());
	}

	deleteTransactionType(id: string) {
		return this._http.delete(Config.apiURL + "transaction-type/" + id).map(res => res.json());
	}

	updateTransactionType(transactionType: TransactionType) {
		return this._http.put(Config.apiURL + "transaction-type/" + transactionType._id, transactionType).map(res => res.json());
	}
}