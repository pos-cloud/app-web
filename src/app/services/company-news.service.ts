import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { CompanyNews } from './../models/company-news';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class CompanyNewsService {

	constructor(
		public _http: Http,
		public _authService: AuthService
	) { }

	getLastCompanyNews() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + 'news/sort="code":-1&limit=1', { headers: headers }).map(res => res.json());
	}

	getCompanyNews(id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "company-news/" + id, { headers: headers }).map(res => res.json());
	}

	getCompaniesNews(query?: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		if (query) {
			return this._http.get(Config.apiURL + "news/"+query, { headers: headers }).map(res => res.json());
		} else {
			return this._http.get(Config.apiURL + "news", { headers: headers }).map(res => res.json());
		}
	}

	saveCompanyNews(companyNews: CompanyNews) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.post(Config.apiURL + "company-news", companyNews, { headers: headers }).map(res => res.json());
	}

	deleteCompanyNews(id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.delete(Config.apiURL + "company-news/" + id, { headers: headers }).map(res => res.json());
	}

	updateCompanyNews(companyNews: CompanyNews) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.put(Config.apiURL + "company-news/" + companyNews._id, companyNews, { headers: headers }).map(res => res.json());
	}
}
