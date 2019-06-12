import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { empty } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { RelationType } from './../models/relation-type';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class RelationTypeService {

	constructor(
		public _http: Http,
		public _authService: AuthService
	) { }

	getLastRelationType () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + 'relation-types/sort="code":-1&limit=1', { headers: headers }).map (res => res.json());
	}

	getRelationType (id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "relation-type/"+id, { headers: headers }).map (res => res.json());
	}

	getRelationTypes () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
    return this._http.get(Config.apiURL + 'relation-types/sort="description":1', { headers: headers }).map (res => res.json());
	}

	saveRelationType (relationType : RelationType) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
    return this._http.post(Config.apiURL + "relation-type",relationType, { headers: headers }).map (res => res.json());
	}

	deleteRelationType (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
    return this._http.delete(Config.apiURL + "relation-type/"+id, { headers: headers }).map (res => res.json());
	}

	updateRelationType (relationType: RelationType){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
    return this._http.put(Config.apiURL + "relation-type/" + relationType._id, relationType, { headers: headers }).map (res => res.json());
	}
}
