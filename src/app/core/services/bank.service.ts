import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Bank } from '@types';
import { Config } from 'app/app.config';
import { ModelService } from 'app/core/services/model.service';
import { catchError, map, Observable, of } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class BankService extends ModelService {
  constructor(public _http: HttpClient, public _authService: AuthService) {
    super(
      `banks`, // PATH
      _http,
      _authService
    );
  }

  public getBank(_id: string): Observable<any> {
    const URL = `${Config.apiURL}bank`;

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

  public getBanks(project: {}, match: {}, sort: {}, group: {}, limit: number = 0, skip: number = 0): Observable<any> {
    const URL = `${Config.apiURL}banks`;

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

  public saveBank(bank: Bank): Observable<any> {
    const URL = `${Config.apiURL}bank`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(URL, bank, {
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

  public updateBank(bank: Bank): Observable<any> {
    const URL = `${Config.apiURL}bank`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams().set('id', bank._id);

    return this._http
      .put(URL, bank, {
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

  public deleteBank(_id: string): Observable<any> {
    const URL = `${Config.apiURL}bank`;

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
