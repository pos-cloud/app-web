import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Company } from './../models/company';

@Injectable()
export class CompanyService {
  
  public url: string;

  constructor(public _http: Http) { 
    this.url = 'http://192.168.0.16:3000/api/';
  }

  getLastCompany () {
    return this._http.get(this.url+'companies/sort="code":-1&limit=1').map (res => res.json());
  }

  getCompany (id) {
    return this._http.get(this.url+"company/"+id).map (res => res.json());
  }

  getCompanies () {
    return this._http.get(this.url+"companies").map (res => res.json());
  }

  saveCompany (company : Company) {
    return this._http.post(this.url+"company",company).map (res => res.json());
  }
  
  deleteCompany (id: string) {
    return this._http.delete(this.url+"company/"+id).map (res => res.json());
  }

  updateCompany (company: Company){
    return this._http.put(this.url+"company/"+company._id, company).map (res => res.json());
  }
}
