import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { of } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class ImportService {

  constructor(
		private _http: HttpClient,
		private _authService: AuthService
  ) { }

  public import(objectToImport: {}): Observable<any> {

    const URL = `${Config.apiURL}import-xlsx`;

    const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', this._authService.getToken());

    return this._http.post(URL, objectToImport, {
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
  
  public importMovement(objectToImport: {}, transaccionId: string): Observable<any> {

    const URL = `${Config.apiURL}import-movement`;

    const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
        .set('transaccion', transaccionId);

    return this._http.post(URL, objectToImport, {
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
