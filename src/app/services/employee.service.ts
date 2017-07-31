import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Employee } from './../models/employee';
import { Config } from './../app.config';

@Injectable()
export class EmployeeService {

  constructor(public _http: Http) { }

  getLastEmployee () {
		return this._http.get(Config.apiURL + 'employees/sort="_id":-1&limit=1').map (res => res.json());
	}

  getEmployee (id) {
		return this._http.get(Config.apiURL + "employee/"+id).map (res => res.json());
	}

  getEmployees () {
		return this._http.get(Config.apiURL + "employees").map (res => res.json());
	}

  saveEmployee (employee: Employee) {
		return this._http.post(Config.apiURL + "employee",employee).map (res => res.json());
	}

  deleteEmployee (id: string) {
    return this._http.delete(Config.apiURL + "employee/"+id).map (res => res.json());
  }

  updateEmployee (employee: Employee){
    return this._http.put(Config.apiURL + "employee/"+employee._id, employee).map (res => res.json());
  }
}