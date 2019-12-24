import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { of } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class EmailService {

	constructor(
		private _http: HttpClient,
		private _authService: AuthService
	) { }

	public sendEmail(data: {}): Observable<any> {

		const URL = `${Config.apiURL}send-email-client`;

		const headers = new HttpHeaders()
			.set('Content-Type', 'application/json')
			.set('Authorization', this._authService.getToken());

		return this._http.post(URL, data, {
			headers: headers
		}).pipe(
			map(res => {
				return res;
			}),
			catchError((err) => {
				return of(err);
			})
		);
	}
}