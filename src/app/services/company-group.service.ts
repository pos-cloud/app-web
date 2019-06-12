import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { empty } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { CompanyGroup } from './../models/company-group';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class CompanyGroupService {

  constructor(
    public _http: Http,
    public _authService: AuthService
  ) { }

  getLastCompanyGroup () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + 'groups/sort="description":-1&limit=1', { headers: headers }).map (res => res.json());
  }

  getCompanyGroup (id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "group/"+id, { headers: headers }).map (res => res.json());
  }

  getCompaniesGroup () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "groups", { headers: headers }).map (res => res.json());
  }

  saveCompanyGroup (companyGroup : CompanyGroup) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.post(Config.apiURL + "group",companyGroup, { headers: headers }).map (res => res.json());
  }
  
  deleteCompanyGroup (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.delete(Config.apiURL + "group/"+id, { headers: headers }).map (res => res.json());
  }

  updateCompanyGroup (companyGroup: CompanyGroup){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.put(Config.apiURL + "group/"+companyGroup._id, companyGroup, { headers: headers }).map (res => res.json());
  }
}