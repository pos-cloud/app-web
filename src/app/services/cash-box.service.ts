import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { empty } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { CashBox } from './../models/cash-box';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class CashBoxService {

	constructor(
		public _http: Http,
		public _authService: AuthService
	) { }

  	getCashBox (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + 'cash-box/' + id, { headers: headers }).map (res => res.json());
	}

  	getCashBoxes (query?: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		if(query) {
			return this._http.get(Config.apiURL + 'cash-boxes/' + query, { headers: headers }).map (res => res.json());
		} else {
			return this._http.get(Config.apiURL + "cash-boxes", { headers: headers }).map (res => res.json());
		}
	}

  	saveCashBox (cashBox: CashBox) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.post(Config.apiURL + "cash-box", cashBox, { headers: headers }).map (res => res.json());
	}

	deleteCashBox (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.delete(Config.apiURL + "cash-box/"+id, { headers: headers }).map (res => res.json());
	}

  	updateCashBox (cashBox: CashBox){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.put(Config.apiURL + "cash-box/"+cashBox._id, cashBox, { headers: headers }).map (res => res.json());
	}

	getClosingCashBox(id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "get-closing-cash-box/" + id, { headers: headers }).map(res => res.json());
	}
}
