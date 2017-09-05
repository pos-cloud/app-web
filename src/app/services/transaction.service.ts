import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Transaction, TransactionState } from './../models/transaction';
import { Config } from './../app.config';

@Injectable()
export class TransactionService {

  constructor(public _http: Http) { }

  getTransaction (id) {
		return this._http.get(Config.apiURL + "transaction/"+id).map (res => res.json());
	}

  getTransactions () {
		return this._http.get(Config.apiURL + "transactions").map (res => res.json());
	}

  saveTransaction (transaction: Transaction) {
		return this._http.post(Config.apiURL + "transaction",transaction).map (res => res.json());
	}
    
  deleteTransaction (id: string) {
    return this._http.delete(Config.apiURL + "transaction/"+id).map (res => res.json());
  }

  updateTransaction (transaction: Transaction){
    return this._http.put(Config.apiURL + "transaction/"+transaction._id, transaction).map (res => res.json());
  }

	getOpenTransactionByTable (tableId) {
		return this._http.get(Config.apiURL + 'transactions/where="table":"'+tableId+'","state":"'+TransactionState.Open+'"&limit=1').map (res => res.json());
	}

	getOpenTransaction() {
		return this._http.get(Config.apiURL + 'transactions/where="state":"' + TransactionState.Open + '"').map(res => res.json());
	}

  getTransactionsByEmployee (employeeId: string, date: string) {
		return this._http.get(Config.apiURL + 'transactions/'+employeeId+'/'+date).map (res => res.json());
	}

	getLastTransaction() {
		return this._http.get(Config.apiURL + 'transactions/sort="number":-1&limit=1').map(res => res.json());
	}
  
  getLastTransactionByOrigen (origin: number) {
		return this._http.get(Config.apiURL + 'transactions/where="origin":"'+origin+'"&sort="number":-1&limit=1').map (res => res.json());
	}
  
  getLastTransactionByTable (tableId: string) {
		return this._http.get(Config.apiURL + 'transactions/where="table":"'+tableId+'"&sort="number":-1&limit=1').map (res => res.json());
	}
}
