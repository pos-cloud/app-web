import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { of } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Turn } from './../models/turn';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class TurnService {

  constructor(
		private _http: HttpClient,
		private _authService: AuthService
	) { }

  public getTurn(_id: string): Observable<any> {

    const URL = `${Config.apiURL}turn`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
      .set('id', _id);

    return this._http.get(URL, {
        headers: headers,
        params: params
    }).pipe(
        map(res => {
            return res;
        }),
        catchError((err) => {
            return of(err);
        })
    );
  }

  public getTurns(
    query?: string
  ): Observable<any> {

    const URL = `${Config.apiURL}turns`;

    const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')           
        .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
        .set('query', query);

    return this._http.get(URL, {
        headers: headers,
        params: params
    }).pipe(
        map(res => {
            return res;
        }),
        catchError((err) => {
            return of(err);
        })
    );
  }

  public getTurnsV2(
    project: {},
    match: {},
    sort: {},
    group: {},
    limit: number = 0,
    skip: number = 0
  ): Observable<any> {

    const URL = `${Config.apiURL}v2/turns`;

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

    return this._http.get(URL, {
        headers: headers,
        params: params
    }).pipe(
        map(res => {
            return res;
        }),
        catchError((err) => {
            return of(err);
        })
    );
  }

  public getShiftClosingByTransaction(
    _id?: string
  ): Observable<any> {

    const URL = `${Config.apiURL}shift-closing-by-transaction`;

    const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')           
        .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
        .set('_id', _id);

    return this._http.get(URL, {
        headers: headers,
        params: params
    }).pipe(
        map(res => {
            return res;
        }),
        catchError((err) => {
            return of(err);
        })
    );
  }

  public getShiftClosingByMovementOfCash(
    _id?: string
  ): Observable<any> {

    const URL = `${Config.apiURL}shift-closing-by-payment-method`;

    const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')           
        .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
        .set('_id', _id);

    return this._http.get(URL, {
        headers: headers,
        params: params
    }).pipe(
        map(res => {
            return res;
        }),
        catchError((err) => {
            return of(err);
        })
    );
  }

  public getShiftClosingByMovementOfArticle(
    _id?: string
  ): Observable<any> {

    const URL = `${Config.apiURL}shift-closing-by-articl`;

    const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')           
        .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
        .set('_id', _id);

    return this._http.get(URL, {
        headers: headers,
        params: params
    }).pipe(
        map(res => {
            return res;
        }),
        catchError((err) => {
            return of(err);
        })
    );
  }

  public saveTurn(turn: Turn): Observable<any> {

    const URL = `${Config.apiURL}turn`;

    const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', this._authService.getToken());

    return this._http.post(URL, turn, {
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

public updateTurn(turn: Turn): Observable<any> {

    const URL = `${Config.apiURL}turn`;

    const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
        .set('id', turn._id);

    return this._http.put(URL, turn, {
        headers: headers,
        params: params
    }).pipe(
        map(res => {
            return res;
        }),
        catchError((err) => {
            return of(err);
        })
    );
}

public deleteTurn(_id: string): Observable<any> {

    const URL = `${Config.apiURL}turn`;

    const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
        .set('id', _id);

    return this._http.delete(URL, {
        headers: headers,
        params: params
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
