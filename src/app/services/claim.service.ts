import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { of } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class ClaimService {

	constructor(
		private _http: HttpClient,
		private _authService: AuthService
	) { }

	public saveClaim(claim: string): Observable<any> {

        const URL = `${Config.apiURL}claim`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());
        console.log(claim);
        return this._http.post(URL, { claim: claim }, {
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
