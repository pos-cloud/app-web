import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { empty } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { UnitOfMeasurement } from './../models/unit-of-measurement';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class UnitOfMeasurementService {

	constructor(
		public _http: Http,
		public _authService: AuthService
	) { }

	getLastUnitOfMeasurement () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + 'units-of-measurement/sort="code":-1&limit=1', { headers: headers }).map (res => res.json());
	}

	getUnitOfMeasurement (id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "unit-of-measurement/"+id, { headers: headers }).map (res => res.json());
	}

	getUnitsOfMeasurement () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
    return this._http.get(Config.apiURL + 'units-of-measurement/sort="name":1', { headers: headers }).map (res => res.json());
	}

	saveUnitOfMeasurement (unitOfMeasurement : UnitOfMeasurement) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.post(Config.apiURL + "unit-of-measurement",unitOfMeasurement, { headers: headers }).map (res => res.json());
	}

	deleteUnitOfMeasurement (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.delete(Config.apiURL + "unit-of-measurement/"+id, { headers: headers }).map (res => res.json());
	}

	updateUnitOfMeasurement (unitOfMeasurement: UnitOfMeasurement){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.put(Config.apiURL + "unit-of-measurement/"+unitOfMeasurement._id, unitOfMeasurement, { headers: headers }).map (res => res.json());
	}
}
