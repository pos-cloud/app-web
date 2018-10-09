import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { CompanyGroup } from './../models/company-group';
import { Config } from './../app.config';
import { UserService } from './user.service';

@Injectable()
export class CompanyGroupService {

  constructor(
    public _http: Http,
    public _userService: UserService
  ) { }

  getLastCompanyGroup () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'groups/sort="description":-1&limit=1', { headers: headers }).map (res => res.json());
  }

  getCompanyGroup (id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "group/"+id, { headers: headers }).map (res => res.json());
  }

  getCompaniesGroup () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "groups", { headers: headers }).map (res => res.json());
  }

  saveCompanyGroup (companyGroup : CompanyGroup) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.post(Config.apiURL + "group",companyGroup, { headers: headers }).map (res => res.json());
  }
  
  deleteCompanyGroup (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.delete(Config.apiURL + "group/"+id, { headers: headers }).map (res => res.json());
  }

  updateCompanyGroup (companyGroup: CompanyGroup){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.put(Config.apiURL + "group/"+companyGroup._id, companyGroup, { headers: headers }).map (res => res.json());
  }
}