import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Transaction, TransactionState } from './../models/transaction';
import { TransactionType, TransactionMovement } from './../models/transaction-type';
import { Config } from './../app.config';
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
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "transaction/" + id, { headers: headers }).map (res => res.json());
	}

	getTransactions(query?: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		if(query) {
			return this._http.get(Config.apiURL + "transactions/" + query, { headers: headers }).map (res => res.json());
		} else {
			return this._http.get(Config.apiURL + "transactions", { headers: headers }).map(res => res.json());
		}
	}

	getTransactionsByMovement(transactionMovement: TransactionMovement) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'transactions-by-movement/' + transactionMovement + '/sort="endDate":-1', { headers: headers }).map(res => res.json());
	}

	getOpenTransactionsByMovement(transactionMovement: TransactionMovement, posType: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'transactions-by-movement/' + transactionMovement + '/where="$and":[{"state":{"$ne": "' + TransactionState.Closed + '"}},{"state":{"$ne": "' + TransactionState.Canceled + '"}},{"madein":"' + posType + '"}]&sort="startDate":-1', { headers: headers }).map(res => res.json());
	}

	getTransactionsByCompany(id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'transactions/where="company":"' + id + '","state":"' + TransactionState.Closed + '"&sort="endDate":-1', { headers: headers }).map(res => res.json());
	}

	saveTransaction(transaction: Transaction) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.post(Config.apiURL + "transaction", transaction, { headers: headers }).map (res => res.json());
	}
    
	deleteTransaction(id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.delete(Config.apiURL + "transaction/" + id, { headers: headers }).map (res => res.json());
  	}

	updateTransaction(transaction: Transaction) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.put(Config.apiURL + "transaction/" + transaction._id, transaction, { headers: headers }).map (res => res.json());
  	}

	getOpenTransactionByTable(tableId: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'transactions/where="table":"' + tableId + '","state":"' + TransactionState.Open + '"&limit=1', { headers: headers }).map (res => res.json());
	}

	getOpenSaleOrdersByEmployee(employeeId: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'transactions/where="$and":[{"state":{"$ne": "' + TransactionState.Closed + '"}},{"state":{"$ne": "' + TransactionState.Canceled +'"}}],"employeeClosing":"' + employeeId + '"&limit=1', { headers: headers }).map(res => res.json());
	}

	getOpenTransaction(posType: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'transactions/where="$and":[{"state":{"$ne": "' + TransactionState.Closed + '"}},{"state":{"$ne": "' + TransactionState.Canceled + '"}},{"madein":"' + posType + '"}]', { headers: headers }).map(res => res.json());
	}

	getTransactionsByEmployee(employeeId: string, date: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'transactions/' + employeeId + '/' + date, { headers: headers }).map (res => res.json());
	}

	getLastTransaction() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'transactions/sort="number":-1&limit=1', { headers: headers }).map(res => res.json());
	}
  
	getLastTransactionByOrigin(origin: number) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'transactions/where="origin":"' + origin + '"&sort="number":-1&limit=1', { headers: headers }).map (res => res.json());
	}

	getLastTransactionByType(type: TransactionType) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'transactions/where="type":"' + type._id + '"&sort="number":-1&limit=1', { headers: headers }).map(res => res.json());
	}
	
	getLastTransactionByTypeAndOrigin(type: TransactionType, origin: number, letter) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'transactions/where="type":"' + type._id + '","origin":"' + origin + '","letter":"' + letter + '"&sort="number":-1&limit=1', { headers: headers }).map(res => res.json());
	}

	getLastTransactionByTable(tableId: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'transactions/where="table":"' + tableId + '"&sort="number":-1&limit=1', { headers: headers }).map (res => res.json());
	}

	validateElectronicTransaction(transaction: Transaction) {
		let headers = new Headers();
		headers.append('Content-Type', 'application/x-www-form-urlencoded');

		let body= 'transaction='+JSON.stringify(transaction)+'&'+'config='+'{"companyCUIT":"'+Config.companyCUIT+'"}';
		
		return this._http.post(Config.apiURLFE, body, { headers: headers }).map (res => res.json());
	}

	exportCiti(VATPeriod: string) {

		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "export-citi/" + VATPeriod, { headers: headers }).map(res => res.json());
	}

	downloadFile(fileName: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "download-file/" + fileName, { headers: headers }).map(res => res.json());
	}
}
