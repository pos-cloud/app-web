import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Transaction, TransactionState } from './../models/transaction';
import { Config } from './../app.config';
import { Company } from './../models/company';
import { UserService } from './user.service';

@Injectable()
export class TransactionService {

	constructor(
		public _http: Http,
		public _userService: UserService
	) { }

	getTransaction(id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.get(Config.apiURL + "transaction/" + id, { headers: headers }).map (res => res.json());
	}

	getTransactions() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.get(Config.apiURL + "transactions", { headers: headers }).map (res => res.json());
	}

	getTransactionsByCompany(id: String) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.get(Config.apiURL + 'transactions/where="company":"' + id + '","state":"' + TransactionState.Closed + '"', { headers: headers }).map(res => res.json());
	}

	saveTransaction(transaction: Transaction) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.post(Config.apiURL + "transaction", transaction, { headers: headers }).map (res => res.json());
	}
    
	deleteTransaction(id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.delete(Config.apiURL + "transaction/" + id, { headers: headers }).map (res => res.json());
  }

	updateTransaction(transaction: Transaction) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.put(Config.apiURL + "transaction/" + transaction._id, transaction, { headers: headers }).map (res => res.json());
  }

	getOpenTransactionByTable(tableId) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.get(Config.apiURL + 'transactions/where="table":"' + tableId + '","state":"' + TransactionState.Open + '"&limit=1', { headers: headers }).map (res => res.json());
	}

	getOpenTransaction() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.get(Config.apiURL + 'transactions/where="state":"' + TransactionState.Open + '"', { headers: headers }).map(res => res.json());
	}

	getTransactionsByEmployee(employeeId: string, date: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.get(Config.apiURL + 'transactions/' + employeeId + '/' + date, { headers: headers }).map (res => res.json());
	}

	getLastTransaction() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.get(Config.apiURL + 'transactions/sort="number":-1&limit=1', { headers: headers }).map(res => res.json());
	}
  
	getLastTransactionByOrigen(origin: number) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.get(Config.apiURL + 'transactions/where="origin":"' + origin + '"&sort="number":-1&limit=1', { headers: headers }).map (res => res.json());
	}
  
	getLastTransactionByTable(tableId: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.get(Config.apiURL + 'transactions/where="table":"' + tableId + '"&sort="number":-1&limit=1', { headers: headers }).map (res => res.json());
	}
}
