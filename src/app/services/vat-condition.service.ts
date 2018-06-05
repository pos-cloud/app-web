import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { VATCondition } from './../models/vat-condition';
import { Config } from './../app.config';
import { UserService } from './user.service';

@Injectable()
export class VATConditionService {

	constructor(
		public _http: Http,
		public _userService: UserService
	) { }

	getLastVATCondition() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'vat-conditions/sort="code":-1&limit=1', { headers: headers }).map(res => res.json());
	}

	getVATCondition(id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "vat-condition/" + id, { headers: headers }).map(res => res.json());
	}

	getVATConditions() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "vat-conditions", { headers: headers }).map(res => res.json());
	}

	saveVATCondition(vatCondition: VATCondition) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.post(Config.apiURL + "vat-condition", vatCondition, { headers: headers }).map(res => res.json());
	}

	saveVATConditions(vatConditions: VATCondition[]) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.post(Config.apiURL + "vat-condition", vatConditions, { headers: headers }).map(res => res.json());
	}

	deleteVATCondition(id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.delete(Config.apiURL + "vat-condition/" + id, { headers: headers }).map(res => res.json());
	}

	updateVATCondition(vatCondition: VATCondition) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.put(Config.apiURL + "vat-condition/" + vatCondition._id, vatCondition, { headers: headers }).map(res => res.json());
	}
}
