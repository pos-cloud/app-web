import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ModelService } from 'app/core/services/model.service';
import { Config } from '../../app.config';
import { CurrencyValue } from '../../components/currency-value/currency-value';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class CurrencyValueService extends ModelService {
  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {
    super(
      `currency-values`, // PATH
      _http,
      _authService
    );
  }

  public getCurrencyValue(_id: string): Observable<any> {
    const URL = `${Config.apiURL}currency-value`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams().set('id', _id);

    return this._http
      .get(URL, {
        headers: headers,
        params: params,
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

  public getCurrencyValues(
    project: {},
    match: {},
    sort: {},
    group: {},
    limit: number = 0,
    skip: number = 0
  ): Observable<any> {
    const URL = `${Config.apiURL}v2/currency-values`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
      .set('project', JSON.stringify(project))
      .set('match', JSON.stringify(match))
      .set('sort', JSON.stringify(sort))
      .set('group', JSON.stringify(group))
      .set('limit', limit.toString())
      .set('skip', skip.toString());

    return this._http
      .get(URL, {
        headers: headers,
        params: params,
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

  public saveCurrencyValue(currencyType: CurrencyValue): Observable<any> {
    const URL = `${Config.apiURL}currency-value`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(URL, currencyType, {
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

  public updateCurrencyValue(currencyType: CurrencyValue): Observable<any> {
    const URL = `${Config.apiURL}currency-value`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams().set('id', currencyType._id);

    return this._http
      .put(URL, currencyType, {
        headers: headers,
        params: params,
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

  public deleteCurrencyValue(_id: string): Observable<any> {
    const URL = `${Config.apiURL}currency-value`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams().set('id', _id);

    return this._http
      .delete(URL, {
        headers: headers,
        params: params,
      })
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
}
