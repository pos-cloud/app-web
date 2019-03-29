import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Transaction, TransactionState } from './../models/transaction';
import { TransactionType, TransactionMovement } from './../models/transaction-type';
import { Config } from './../app.config';
import { UserService } from './user.service';
import { Observable } from "rxjs/Observable";
import { map } from "rxjs/operators";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { MovementOfArticle } from 'app/models/movement-of-article';

@Injectable()
export class TransactionService {

	constructor(
    public _http: Http,
    private http: HttpClient,
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
		if (query) {
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

	getTotalTransactionsBetweenDates(query: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'total-transactions/' + query, { headers: headers }).map(res => res.json());
	}

	getOpenTransactionsByMovement(transactionMovement: TransactionMovement, posType: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'transactions-by-movement/' + transactionMovement + '/where="$and":[{"state":{"$ne": "' + TransactionState.Closed + '"}},{"state":{"$ne": "' + TransactionState.Canceled + '"}},{"madein":"' + posType + '"}]&sort="startDate":-1', { headers: headers }).map(res => res.json());
	}

	getOpenTransactionsByCashBox(cashBoxId: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'transactions/where="$and":[{"state":{"$ne": "' + TransactionState.Closed + '"}},{"state":{"$ne": "' + TransactionState.Canceled + '"}},{"cashBox":"' + cashBoxId + '"}]', { headers: headers }).map(res => res.json());
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

  validateElectronicTransactionAR(transaction: Transaction) {
		let headers = new Headers();
		headers.append('Content-Type', 'application/x-www-form-urlencoded');

    let body = 'transaction=' + JSON.stringify(transaction) + '&' + 'config=' + '{"companyIdentificationValue":"' + Config.companyIdentificationValue + '","vatCondition":' + Config.companyVatCondition.code + ',"database":"' + this._userService.getDatabase() + '"}';

		return this._http.post(Config.apiURL_FE_AR, body, { headers: headers }).map (res => res.json());
  }

  validateElectronicTransactionMX(transaction: Transaction, movementsOfArticles: MovementOfArticle[]) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    let body = 'transaction=' + JSON.stringify(transaction) + '&' + 'movementsOfArticles=' + JSON.stringify(movementsOfArticles) + '&' + 'config=' + '{"companyIdentificationValue":"' + Config.companyIdentificationValue + '","vatCondition":' + Config.companyVatCondition.code + ',"companyName":"' + Config.companyName + '","database":"' + this._userService.getDatabase() + '"}';
    return this._http.post("http://localhost/libs/fe/mx/01_CFDI_fe.php", body, { headers: headers }).map(res => res.json());
  }

  exportCiti(VATPeriod: string, transactionMovement: TransactionMovement) {

		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
    });
    return this._http.get(Config.apiURL + 'export-citi/{ "VATPeriod": "' + VATPeriod + '", "transactionMovement": "' + transactionMovement + '"}', { headers: headers }).map(res => res.json());
	}

	downloadFile(fileName: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "download-file/" + fileName, { headers: headers }).map(res => res.json());
	}

	getVATBook (cond: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'libroIVA/'+cond, { headers: headers }).map (res => res.json());
  }

  // V2
  public getTransactionsV2(
    project: {},
    match: {},
    sort: {},
    group: {},
    limit: number = 0,
    skip: number = 0
  ): Observable<any> {

	const URL = `${Config.apiURL}v2/transactions`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._userService.getToken())
      .set('Database', this._userService.getDatabase());
    //.set('Authorization', this._authService.getSession()["token"]);

    const params = new HttpParams()
      .set('project', JSON.stringify(project))
      .set('match', JSON.stringify(match))
      .set('sort', JSON.stringify(sort))
      .set('group', JSON.stringify(group))
      .set('limit', limit.toString())
      .set('skip', skip.toString());

    return this.http.get(URL, {
      headers: headers,
      params: params
    }).pipe(
      map(res => {
        return res;
      })
    );
	}
	

	updateBalance(transactionOriginId : Transaction) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.put(Config.apiURL + "update-balance/" , transactionOriginId, { headers: headers }).map (res => res.json());
	}
}
