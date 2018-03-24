import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { EmployeeType } from './../models/employee-type';
import { Config } from './../app.config';
import { UserService } from './user.service';

@Injectable()
export class EmployeeTypeService {

  constructor(
    public _http: Http,
    public _userService: UserService
  ) { }

  getLastEmployeeType () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'employees/sort="_id":-1&limit=1', { headers: headers }).map (res => res.json());
  }

  getEmployeeType (id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "employee-type/"+id, { headers: headers }).map (res => res.json());
  }

  getEmployeeTypes () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "employee-types", { headers: headers }).map (res => res.json());
  }

  saveEmployeeType (employeeType: EmployeeType) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.post(Config.apiURL + "employee-type",employeeType, { headers: headers }).map (res => res.json());
  }

  deleteEmployeeType (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.delete(Config.apiURL + "employee-type/"+id, { headers: headers }).map (res => res.json());
  }

  updateEmployeeType (employeeType: EmployeeType){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.put(Config.apiURL + "employee-type/"+employeeType._id, employeeType, { headers: headers }).map (res => res.json());
  }
}