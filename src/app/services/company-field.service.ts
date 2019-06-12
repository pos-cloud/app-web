import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { empty } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { CompanyField } from './../models/company-field';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class CompanyFieldService {

	constructor(
		public _http: Http,
		public _authService: AuthService
	) { }

	getLastCompanyField () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + 'company-fields/sort="code":-1&limit=1', { headers: headers }).map (res => res.json());
	}

	getCompanyField (id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "company-field/"+id, { headers: headers }).map (res => res.json());
	}

	getCompanyFields () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "company-fields", { headers: headers }).map (res => res.json());
	}

	saveCompanyField (companyField : CompanyField) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.post(Config.apiURL + "company-field",companyField, { headers: headers }).map (res => res.json());
	}
  
	deleteCompanyField (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.delete(Config.apiURL + "company-field/"+id, { headers: headers }).map (res => res.json());
	}

	updateCompanyField (companyField: CompanyField){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.put(Config.apiURL + "company-field/"+companyField._id, companyField, { headers: headers }).map (res => res.json());
	}
}
