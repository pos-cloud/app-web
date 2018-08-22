import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Deposit } from './../models/deposit';
import { Config } from './../app.config';
import { UserService } from './user.service';

@Injectable()
export class DepositService {

	constructor(
		public _http: Http,
		public _userService: UserService
	) { }

	getLastDeposit() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'deposits/sort="description":-1&limit=1', { headers: headers }).map(res => res.json());
	}

	getDeposit(id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "deposit/" + id, { headers: headers }).map(res => res.json());
	}

	getDeposits(query?: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		if(query) {
			return this._http.get(Config.apiURL + 'deposits/' + query, { headers: headers }).map(res => res.json());
		} else {
			return this._http.get(Config.apiURL + "deposits", { headers: headers }).map(res => res.json());
		}
	}

	saveDeposit(deposit: Deposit) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.post(Config.apiURL + "deposit", deposit, { headers: headers }).map(res => res.json());
	}

	deleteDeposit(id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.delete(Config.apiURL + "deposit/" + id, { headers: headers }).map(res => res.json());
	}

	updateDeposit(deposit: Deposit) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.put(Config.apiURL + "deposit/" + deposit._id, deposit, { headers: headers }).map(res => res.json());
	}
}
