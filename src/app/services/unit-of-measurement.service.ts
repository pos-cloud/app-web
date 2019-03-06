import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { UnitOfMeasurement } from './../models/unit-of-measurement';
import { Config } from './../app.config';
import { UserService } from './user.service';

@Injectable()
export class UnitOfMeasurementService {

	constructor(
		public _http: Http,
		public _userService: UserService
	) { }

	getLastUnitOfMeasurement () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'units-of-measurement/sort="code":-1&limit=1', { headers: headers }).map (res => res.json());
	}

	getUnitOfMeasurement (id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "unit-of-measurement/"+id, { headers: headers }).map (res => res.json());
	}

	getUnitsOfMeasurement () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
    return this._http.get(Config.apiURL + 'units-of-measurement/sort="name":1', { headers: headers }).map (res => res.json());
	}

	saveUnitOfMeasurement (unitOfMeasurement : UnitOfMeasurement) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.post(Config.apiURL + "unit-of-measurement",unitOfMeasurement, { headers: headers }).map (res => res.json());
	}

	deleteUnitOfMeasurement (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.delete(Config.apiURL + "unit-of-measurement/"+id, { headers: headers }).map (res => res.json());
	}

	updateUnitOfMeasurement (unitOfMeasurement: UnitOfMeasurement){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.put(Config.apiURL + "unit-of-measurement/"+unitOfMeasurement._id, unitOfMeasurement, { headers: headers }).map (res => res.json());
	}
}
