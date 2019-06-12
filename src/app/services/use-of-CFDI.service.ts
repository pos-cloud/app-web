import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { UseOfCFDI } from './../models/use-of-CFDI';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class UseOfCFDIService {

	constructor(
		public _http: Http,
		public _authService: AuthService
	) { }

	getLastUseOfCFDI () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + 'uses-of-cfdi/sort="code":-1&limit=1', { headers: headers }).map (res => res.json());
	}

	getUseOfCFDI (id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "use-of-cfdi/"+id, { headers: headers }).map (res => res.json());
	}

	getUsesOfCFDI () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
    return this._http.get(Config.apiURL + 'uses-of-cfdi/sort="name":1', { headers: headers }).map (res => res.json());
	}

	saveUseOfCFDI (identificationType : UseOfCFDI) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
    return this._http.post(Config.apiURL + "use-of-CFDI",identificationType, { headers: headers }).map (res => res.json());
	}

	deleteUseOfCFDI (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
    return this._http.delete(Config.apiURL + "use-of-cfdi/"+id, { headers: headers }).map (res => res.json());
	}

	updateUseOfCFDI (identificationType: UseOfCFDI){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
    return this._http.put(Config.apiURL + "use-of-cfdi/" + identificationType._id, identificationType, { headers: headers }).map (res => res.json());
	}
}
