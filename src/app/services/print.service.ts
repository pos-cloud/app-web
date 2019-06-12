import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { empty } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Print } from './../models/print';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class PrintService {

	constructor(
		public _http: Http,
		public _authService: AuthService
	) { }

	toPrint(print: Print) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.post(Config.apiURL + 'to-print', print, { headers: headers }).map(res => res.json());
	}

	getBarcode(barcode : string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL +'barcode/'+ barcode, { headers: headers }).map(res => res.json());
	}
}