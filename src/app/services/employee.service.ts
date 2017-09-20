import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Employee } from './../models/employee';
import { Config } from './../app.config';
import { UserService } from './user.service';

@Injectable()
export class EmployeeService {

  constructor(
    public _http: Http,
    public _userService: UserService
  ) { }

  getLastEmployee () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.get(Config.apiURL + 'employees/sort="_id":-1&limit=1', { headers: headers }).map (res => res.json());
	}

  getEmployee (id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.get(Config.apiURL + "employee/"+id, { headers: headers }).map (res => res.json());
	}

  getEmployees () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.get(Config.apiURL + "employees", { headers: headers }).map (res => res.json());
  }
  
  getWaiters () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.get(Config.apiURL + "employees", { headers: headers }).map (res => res.json());
	}

  saveEmployee(employee: Employee) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken()
    });
    return this._http.post(Config.apiURL + "employee", employee, { headers: headers }).map(res => res.json());
	}

  deleteEmployee (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.delete(Config.apiURL + "employee/"+id, { headers: headers }).map (res => res.json());
  }

  updateEmployee (employee: Employee){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.put(Config.apiURL + "employee/"+employee._id, employee, { headers: headers }).map (res => res.json());
  }
}