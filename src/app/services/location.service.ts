import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { empty } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Location } from './../models/location';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class LocationService {

	constructor(
		public _http: Http,
		public _authService: AuthService
  ) { }
  
  getLastLocation() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + 'locations/sort="description":-1&limit=1', { headers: headers }).map(res => res.json());
	}

	getLocation(id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "location/" + id, { headers: headers }).map(res => res.json());
	}

	getLocations(query?: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		if (query) {
			return this._http.get(Config.apiURL + 'locations/' + query, { headers: headers }).map(res => res.json());
		} else {
			return this._http.get(Config.apiURL + "locations", { headers: headers }).map(res => res.json());
		}
	}

	saveLocation(location: Location) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.post(Config.apiURL + "location", location, { headers: headers }).map(res => res.json());
	}

	deleteLocation(id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.delete(Config.apiURL + "location/" + id, { headers: headers }).map(res => res.json());
	}

	updateLocation(location: Location) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.put(Config.apiURL + "location/" + location._id, location, { headers: headers }).map(res => res.json());
	}
}
