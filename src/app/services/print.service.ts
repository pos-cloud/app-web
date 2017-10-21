import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Print } from './../models/print';
import { Config } from './../app.config';
import { UserService } from './user.service';

@Injectable()
export class PrintService {

	constructor(
		public _http: Http,
		public _userService: UserService
	) { }

	toPrint(print: Print) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.post(Config.apiURL + 'to-print', print, { headers: headers }).map(res => res.json());
	}
}