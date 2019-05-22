import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Make } from './../models/make';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class MakeService {

	constructor(
		public _http: Http,
		public _authService: AuthService
	) { }

	getLastMake () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + 'makes/sort="description":-1&limit=1', { headers: headers }).map (res => res.json());
	}

	getMake (id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "make/"+id, { headers: headers }).map (res => res.json());
	}

	getMakes (query?: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		if(query) {
			return this._http.get(Config.apiURL + 'makes/' + query, { headers: headers }).map (res => res.json());
		} else {
			return this._http.get(Config.apiURL + 'makes', { headers: headers }).map (res => res.json());
		}
	}

	saveMake (make : Make) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.post(Config.apiURL + "make",make, { headers: headers }).map (res => res.json());
	}
  
	deleteMake (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.delete(Config.apiURL + "make/"+id, { headers: headers }).map (res => res.json());
	}

	updateMake (make: Make){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.put(Config.apiURL + "make/"+make._id, make, { headers: headers }).map (res => res.json());
	}

	getSalesByMake(query: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "sales-by-make/" + query, { headers: headers }).map(res => res.json());
	}
}