import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Company } from './../models/company';
import { Config } from './../app.config';

@Injectable()
export class CompanyService {

  constructor(public _http: Http) { }

  getLastCompany () {
    return this._http.get(Config.apiURL + 'companies/sort="code":-1&limit=1').map (res => res.json());
  }

  getCompany (id) {
    return this._http.get(Config.apiURL + "company/"+id).map (res => res.json());
  }

  getCompanies () {
    return this._http.get(Config.apiURL + "companies").map (res => res.json());
  }

  saveCompany (company : Company) {
    return this._http.post(Config.apiURL + "company",company).map (res => res.json());
  }
  
  deleteCompany (id: string) {
    return this._http.delete(Config.apiURL + "company/"+id).map (res => res.json());
  }

  updateCompany (company: Company){
    return this._http.put(Config.apiURL + "company/"+company._id, company).map (res => res.json());
  }
}
