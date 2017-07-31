import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Make } from './../models/make';
import { Config } from './../app.config';

@Injectable()
export class MakeService {

  constructor(public _http: Http) { }

  getLastMake () {
    return this._http.get(Config.apiURL + 'makes/sort="description":-1&limit=1').map (res => res.json());
  }

  getMake (id) {
    return this._http.get(Config.apiURL + "make/"+id).map (res => res.json());
  }

  getMakes () {
    return this._http.get(Config.apiURL + "makes").map (res => res.json());
  }

  saveMake (make : Make) {
    return this._http.post(Config.apiURL + "make",make).map (res => res.json());
  }
  
  deleteMake (id: string) {
    return this._http.delete(Config.apiURL + "make/"+id).map (res => res.json());
  }

  updateMake (make: Make){
    return this._http.put(Config.apiURL + "make/"+make._id, make).map (res => res.json());
  }
}