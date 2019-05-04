import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { VariantType } from './../models/variant-type';
import { Config } from './../app.config';
import { UserService } from './user.service';

@Injectable()
export class VariantTypeService {

  constructor(
    public _http: Http,
    public _userService: UserService
  ) { }

  getLastVariantType() {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken(),
      'Database': this._userService.getDatabase()
    });
    return this._http.get(Config.apiURL + 'variant-types/sort="name":-1&limit=1', { headers: headers }).map(res => res.json());
  }

  getVariantType(id) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken(),
      'Database': this._userService.getDatabase()
    });
    return this._http.get(Config.apiURL + "variant-type/" + id, { headers: headers }).map(res => res.json());
  }

  getVariantTypes(query?: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken(),
      'Database': this._userService.getDatabase()
    });
    if(query) {
      return this._http.get(Config.apiURL + 'variant-types/' + query, { headers: headers }).map(res => res.json());
    } else {
      return this._http.get(Config.apiURL + 'variant-types', { headers: headers }).map(res => res.json());
    }
  }

  saveVariantType(variantType: VariantType) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken(),
      'Database': this._userService.getDatabase()
    });
    return this._http.post(Config.apiURL + "variant-type", variantType, { headers: headers }).map(res => res.json());
  }

  deleteVariantType(id: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken(),
      'Database': this._userService.getDatabase()
    });
    return this._http.delete(Config.apiURL + "variant-type/" + id, { headers: headers }).map(res => res.json());
  }

  updateVariantType(variantType: VariantType) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken(),
      'Database': this._userService.getDatabase()
    });
    return this._http.put(Config.apiURL + "variant-type/" + variantType._id, variantType, { headers: headers }).map(res => res.json());
  }
}