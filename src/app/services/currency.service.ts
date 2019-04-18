import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Currency } from './../models/currency';
import { Config } from './../app.config';
import { UserService } from './user.service';

@Injectable()
export class CurrencyService {

	constructor(
		public _http: Http,
		public _userService: UserService
	) { }

	getLastCurrency () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'currencies/sort="code":-1&limit=1', { headers: headers }).map (res => res.json());
	}

	getCurrency (id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "currency/"+id, { headers: headers }).map (res => res.json());
	}

	getCurrencies (query?: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		if(query) {
			return this._http.get(Config.apiURL + 'currencies/' + query, { headers: headers }).map (res => res.json());
		} else {
			return this._http.get(Config.apiURL + 'currencies', { headers: headers }).map (res => res.json());
		}
	}

	saveCurrency (currency : Currency) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.post(Config.apiURL + "currency",currency, { headers: headers }).map (res => res.json());
	}
  
	deleteCurrency (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.delete(Config.apiURL + "currency/"+id, { headers: headers }).map (res => res.json());
	}

	updateCurrency (currency: Currency){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.put(Config.apiURL + "currency/"+currency._id, currency, { headers: headers }).map (res => res.json());
	}
}