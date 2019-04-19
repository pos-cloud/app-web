import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Variant } from './../models/variant';
import { Article } from './../models/article';
import { Config } from './../app.config';
import { UserService } from './user.service';

@Injectable()
export class VariantService {

  constructor(
    public _http: Http,
    public _userService: UserService
  ) { }

  getLastVariant() {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken(),
      'Database': this._userService.getDatabase()
    });
    return this._http.get(Config.apiURL + 'variants/sort="name":-1&limit=1', { headers: headers }).map(res => res.json());
  }

  getVariant(id) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken(),
      'Database': this._userService.getDatabase()
    });
    return this._http.get(Config.apiURL + "variant/" + id, { headers: headers }).map(res => res.json());
  }

  getVariants(query?: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken(),
      'Database': this._userService.getDatabase()
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
      'Authorization': this._userService.getToken(),
      'Database': this._userService.getDatabase()
    });
    return this._http.post(Config.apiURL + "variant", variant, { headers: headers }).map(res => res.json());
  }

  deleteVariant(id: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken(),
      'Database': this._userService.getDatabase()
    });
    return this._http.delete(Config.apiURL + "variant/" + id, { headers: headers }).map(res => res.json());
  }

  updateVariant(variant: Variant) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken(),
      'Database': this._userService.getDatabase()
    });
    return this._http.put(Config.apiURL + "variant/" + variant._id, variant, { headers: headers }).map(res => res.json());
  }
}