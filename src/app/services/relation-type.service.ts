import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { RelationType } from './../models/relation-type';
import { Config } from './../app.config';
import { UserService } from './user.service';

@Injectable()
export class RelationTypeService {

	constructor(
		public _http: Http,
		public _userService: UserService
	) { }

	getLastRelationType () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'relation-types/sort="code":-1&limit=1', { headers: headers }).map (res => res.json());
	}

	getRelationType (id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "relation-type/"+id, { headers: headers }).map (res => res.json());
	}

	getRelationTypes () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
    return this._http.get(Config.apiURL + 'relation-types/sort="description":1', { headers: headers }).map (res => res.json());
	}

	saveRelationType (relationType : RelationType) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
    return this._http.post(Config.apiURL + "relation-type",relationType, { headers: headers }).map (res => res.json());
	}

	deleteRelationType (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
    return this._http.delete(Config.apiURL + "relation-type/"+id, { headers: headers }).map (res => res.json());
	}

	updateRelationType (relationType: RelationType){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
    return this._http.put(Config.apiURL + "relation-type/" + relationType._id, relationType, { headers: headers }).map (res => res.json());
	}
}
