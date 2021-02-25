
import { ModelService } from '../model/model.service';
import { AuthService } from '../login/auth.service';
import { Config } from "app/app.config";

import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { of } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

@Injectable()
export class AccountSeatService extends ModelService {

  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {
    super(
      `account-seats`, // PATH
      _http,
      _authService
    );
  }

  public addAccountSeatByTransaction(transactionId: string): Observable<any> {

    const URL = `${Config.apiV8URL}account-seat-transaction`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.post(URL+`/${transactionId}`,{}, {
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
