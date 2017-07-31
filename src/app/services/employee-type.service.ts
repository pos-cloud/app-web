import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { EmployeeType } from './../models/employee-type';
import { Config } from './../app.config';

@Injectable()
export class EmployeeTypeService {

  constructor(public _http: Http) { }

  getLastEmployeeType () {
    return this._http.get(Config.apiURL + 'employees/sort="_id":-1&limit=1').map (res => res.json());
  }

  getEmployeeType (id) {
    return this._http.get(Config.apiURL + "employee-type/"+id).map (res => res.json());
  }

  getEmployeeTypes () {
    return this._http.get(Config.apiURL + "employee-types").map (res => res.json());
  }

  saveEmployeeType (employeeType: EmployeeType) {
    return this._http.post(Config.apiURL + "employee-type",employeeType).map (res => res.json());
  }

  deleteEmployeeType (id: string) {
    return this._http.delete(Config.apiURL + "employee-type/"+id).map (res => res.json());
  }

  updateEmployeeType (employeeType: EmployeeType){
    return this._http.put(Config.apiURL + "employee-type/"+employeeType._id, employeeType).map (res => res.json());
  }
}