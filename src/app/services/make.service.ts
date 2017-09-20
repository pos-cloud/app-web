import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Make } from './../models/make';
import { Config } from './../app.config';
import { UserService } from './user.service';

@Injectable()
export class MakeService {

  constructor(
    public _http: Http,
    public _userService: UserService
  ) { }

  getLastMake () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.get(Config.apiURL + 'makes/sort="description":-1&limit=1', { headers: headers }).map (res => res.json());
  }

  getMake (id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.get(Config.apiURL + "make/"+id, { headers: headers }).map (res => res.json());
  }

  getMakes () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.get(Config.apiURL + "makes", { headers: headers }).map (res => res.json());
  }

  saveMake (make : Make) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.post(Config.apiURL + "make",make, { headers: headers }).map (res => res.json());
  }
  
  deleteMake (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.delete(Config.apiURL + "make/"+id, { headers: headers }).map (res => res.json());
  }

  updateMake (make: Make){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.put(Config.apiURL + "make/"+make._id, make, { headers: headers }).map (res => res.json());
  }
}