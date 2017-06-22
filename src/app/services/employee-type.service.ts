import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { EmployeeType } from './../models/employee-type';

@Injectable()
export class EmployeeTypeService {

  public url: string;

  constructor(public _http: Http) {
    this.url = 'http://localhost:3000/api/';
  }

  getLastEmployeeType () {
    return this._http.get(this.url+'employees/sort="_id":-1&limit=1').map (res => res.json());
  }

  getEmployeeType (id) {
    return this._http.get(this.url+"employee-type/"+id).map (res => res.json());
  }

  getEmployeeTypes () {
    return this._http.get(this.url+"employee-types").map (res => res.json());
  }

  saveEmployeeType (employeeType: EmployeeType) {
    return this._http.post(this.url+"employee-type",employeeType).map (res => res.json());
  }

  deleteEmployeeType (id: string) {
    return this._http.delete(this.url+"employee-type/"+id).map (res => res.json());
  }

  updateEmployeeType (employeeType: EmployeeType){
    return this._http.put(this.url+"employee-type/"+employeeType._id, employeeType).map (res => res.json());
  }
}