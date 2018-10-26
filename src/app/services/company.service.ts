import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Company } from './../models/company';
import { Config } from './../app.config';
import { UserService } from './user.service';

@Injectable()
export class CompanyService {

	constructor(
		public _http: Http,
		public _userService: UserService
	) { }

  	getLastCompany () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'companies/sort="code":-1&limit=1', { headers: headers }).map (res => res.json());
  	}

  	getCompany (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "company/"+id, { headers: headers }).map (res => res.json());
  	}

  	getCompanies () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "companies", { headers: headers }).map (res => res.json());
  	}


  	getCompaniesByType (type: string) {
	  	let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'companies/where="type":"' + type + '"', { headers: headers }).map (res => res.json());
	}

	saveCompany (company : Company) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.post(Config.apiURL + "company",company, { headers: headers }).map (res => res.json());
	}

	deleteCompany (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.delete(Config.apiURL + "company/"+id, { headers: headers }).map (res => res.json());
	}

  	updateCompany (company: Company){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.put(Config.apiURL + "company/"+company._id, company, { headers: headers }).map (res => res.json());
	}

	getQuantityOfCompaniesByType(type: string, startDate: string, endDate: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		var query = '{"type":"' + type +'","startDate":"' + startDate + '", "endDate":"' + endDate + '"}';
		return this._http.get(Config.apiURL + "quantity-of-companies-by-type/" + query, { headers: headers }).map(res => res.json());
	}

	getSalesByClient(query: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'sales-by-client/' + query, { headers: headers }).map(res => res.json());
	}

  getSummaryOfAccounts(companyId?: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
    });

    if (companyId) {
      return this._http.get(Config.apiURL + "summary-of-accounts/" + companyId, { headers: headers }).map(res => res.json());
    } else {
      return this._http.get(Config.apiURL + "summary-of-accounts/", { headers: headers }).map(res => res.json());
    }
  }
}
