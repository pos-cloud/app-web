import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { of } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { catchError, map } from 'rxjs/operators';

import { AuthService } from 'app/components/login/auth.service';

@Injectable()
export class CurrentAccountService {
  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {}

  public getSummaryOfAccountsByCompany(data: {}): Observable<any> {
    const URL = `${environment.apiv2}/companies/details-of-accounts-by-company`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(URL, data, {
        headers: headers,
      })
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((err) => {
          return of(err);
        })
      );
  }

  public getTotalOfAccountsByCompany(data: {}): Observable<any> {
    const URL = `${environment.apiv2}/companies/total-of-accounts-by-company`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(URL, data, {
        headers: headers,
      })
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((err) => {
          return of(err);
        })
      );
  }

  public getBalanceOfAccountsByCompany(data: {}): Observable<any> {
    const URL = `${environment.apiv2}/companies/balance-of-accounts-by-company`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(URL, data, {
        headers: headers,
      })
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((err) => {
          return of(err);
        })
      );
  }

  public getPaymentMethodOfAccountsByCompany(data: {}): Observable<any> {
    const URL = `${environment.apiv2}/companies/payment-method-of-accounts-by-company`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(URL, data, {
        headers: headers,
      })
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((err) => {
          return of(err);
        })
      );
  }
}
