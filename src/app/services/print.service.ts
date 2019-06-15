import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { of } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Print } from './../models/print';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class PrintService {

	constructor(
		private _http: HttpClient,
		private _authService: AuthService
	) { }

	public toPrint(print: Print): Observable<any> {

        const URL = `${Config.apiURL}to-print`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        return this._http.post(URL, print, {
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

	public getBarcode(barcode : string): Observable<any> {

        const URL = `${Config.apiURL}barcode/${barcode}`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        return this._http.get(URL, {
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