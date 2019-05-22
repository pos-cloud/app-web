import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { VariantValue } from './../models/variant-value';
import { Config } from './../app.config';
import { AuthService } from './auth.service';
import { VariantType } from '../models/variant-type';

@Injectable()
export class VariantValueService {

  constructor(
    public _http: Http,
    public _authService: AuthService
  ) { }

  getLastVariantValue() {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.get(Config.apiURL + 'variant-values/sort="name":-1&limit=1', { headers: headers }).map(res => res.json());
  }

  getVariantValue(id) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.get(Config.apiURL + "variant-value/" + id, { headers: headers }).map(res => res.json());
  }

  getVariantValues(query?: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    if(query) {
      return this._http.get(Config.apiURL + 'variant-values/' + query, { headers: headers }).map(res => res.json());
    } else {
      return this._http.get(Config.apiURL + 'variant-values', { headers: headers }).map(res => res.json());
    }
  }

  saveVariantValue(variantValue: VariantValue) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.post(Config.apiURL + "variant-value", variantValue, { headers: headers }).map(res => res.json());
  }

  deleteVariantValue(id: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.delete(Config.apiURL + "variant-value/" + id, { headers: headers }).map(res => res.json());
  }

  updateVariantValue(variantValue: VariantValue) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.put(Config.apiURL + "variant-value/" + variantValue._id, variantValue, { headers: headers }).map(res => res.json());
  }
}