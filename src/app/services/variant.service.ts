import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { empty } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Variant } from './../models/variant';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class VariantService {

  constructor(
    public _http: Http,
    public _authService: AuthService
  ) { }

  getLastVariant() {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.get(Config.apiURL + 'variants/sort="name":-1&limit=1', { headers: headers }).map(res => res.json());
  }

  getVariant(id) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.get(Config.apiURL + "variant/" + id, { headers: headers }).map(res => res.json());
  }

  getVariants(query?: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    if(query) {
      return this._http.get(Config.apiURL + "variants/" + query, { headers: headers }).map(res => res.json());
    } else {
      return this._http.get(Config.apiURL + "variants", { headers: headers }).map(res => res.json());
    }
  }

  saveVariant(variant: Variant) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.post(Config.apiURL + "variant", variant, { headers: headers }).map(res => res.json());
  }

  deleteVariant(id: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.delete(Config.apiURL + "variant/" + id, { headers: headers }).map(res => res.json());
  }

  updateVariant(variant: Variant) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.put(Config.apiURL + "variant/" + variant._id, variant, { headers: headers }).map(res => res.json());
  }
}