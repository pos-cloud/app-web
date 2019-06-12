import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { CompanyContact } from './../models/company-contact';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class CompanyContactService {

	constructor(
		public _http: Http,
		public _authService: AuthService
	) { }

	getLastCompanyContact() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + 'contact/sort="code":-1&limit=1', { headers: headers }).map(res => res.json());
	}

	getCompanyContact(id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "company-contact/" + id, { headers: headers }).map(res => res.json());
	}

	getCompaniesContact(query?: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		if (query) {
			return this._http.get(Config.apiURL + "contact/"+query, { headers: headers }).map(res => res.json());
		} else {
			return this._http.get(Config.apiURL + "contact", { headers: headers }).map(res => res.json());
		}
	}

	saveCompanyContact(companyContact: CompanyContact) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.post(Config.apiURL + "company-contact", companyContact, { headers: headers }).map(res => res.json());
	}

	deleteCompanyContact(id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.delete(Config.apiURL + "company-contact/" + id, { headers: headers }).map(res => res.json());
	}

	updateCompanyContact(companyContact: CompanyContact) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.put(Config.apiURL + "company-contact/" + companyContact._id, companyContact, { headers: headers }).map(res => res.json());
	}
}
