import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Employee } from './../models/employee';

@Injectable()
export class EmployeeService {

  public url: string;

  constructor(public _http: Http) {
    this.url = 'http://localhost:3000/api/';
  }

  getLastEmployee () {
		return this._http.get(this.url+'employees/sort="_id":-1&limit=1').map (res => res.json());
	}

  getEmployee (id) {
		return this._http.get(this.url+"employee/"+id).map (res => res.json());
	}

  getEmployees () {
		return this._http.get(this.url+"employees").map (res => res.json());
	}

  saveEmployee (employee: Employee) {
		return this._http.post(this.url+"employee",employee).map (res => res.json());
	}

  deleteEmployee (id: string) {
    return this._http.delete(this.url+"employee/"+id).map (res => res.json());
  }

  updateEmployee (employee: Employee){
    return this._http.put(this.url+"employee/"+employee._id, employee).map (res => res.json());
  }
}