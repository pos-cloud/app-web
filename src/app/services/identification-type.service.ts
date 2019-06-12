import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { IdentificationType } from './../models/identification-type';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class IdentificationTypeService {

	constructor(
		public _http: Http,
		public _authService: AuthService
	) { }

	getLastIdentificationType () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + 'identification-types/sort="code":-1&limit=1', { headers: headers }).map (res => res.json());
	}

	getIdentificationType (id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "identification-type/"+id, { headers: headers }).map (res => res.json());
	}

	getIdentificationTypes () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
    return this._http.get(Config.apiURL + 'identification-types/sort="name":1', { headers: headers }).map (res => res.json());
	}

	saveIdentificationType (identificationType : IdentificationType) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
    return this._http.post(Config.apiURL + "identification-type",identificationType, { headers: headers }).map (res => res.json());
	}

	deleteIdentificationType (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
    return this._http.delete(Config.apiURL + "identification-type/"+id, { headers: headers }).map (res => res.json());
	}

	updateIdentificationType (identificationType: IdentificationType){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
    return this._http.put(Config.apiURL + "identification-type/" + identificationType._id, identificationType, { headers: headers }).map (res => res.json());
	}
}
