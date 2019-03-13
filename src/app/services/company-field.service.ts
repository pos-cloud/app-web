import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { CompanyField } from './../models/company-field';
import { Config } from './../app.config';
import { UserService } from './user.service';

@Injectable()
export class CompanyFieldService {

	constructor(
		public _http: Http,
		public _userService: UserService
	) { }

	getLastCompanyField () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'company-fields/sort="code":-1&limit=1', { headers: headers }).map (res => res.json());
	}

	getCompanyField (id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "company-field/"+id, { headers: headers }).map (res => res.json());
	}

	getCompanyFields () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "company-fields", { headers: headers }).map (res => res.json());
	}

	saveCompanyField (companyField : CompanyField) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.post(Config.apiURL + "company-field",companyField, { headers: headers }).map (res => res.json());
	}
  
	deleteCompanyField (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.delete(Config.apiURL + "company-field/"+id, { headers: headers }).map (res => res.json());
	}

	updateCompanyField (companyField: CompanyField){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.put(Config.apiURL + "company-field/"+companyField._id, companyField, { headers: headers }).map (res => res.json());
	}
}
