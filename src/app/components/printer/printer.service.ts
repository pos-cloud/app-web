import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {of} from 'rxjs';
import {Observable} from 'rxjs/Observable';
import {map, catchError} from 'rxjs/operators';

import {Config} from '../../app.config';
import {AuthService} from '../login/auth.service';
import {ModelService} from '../model/model.service';

import {Printer} from './printer';

@Injectable()
export class PrinterService extends ModelService {
  constructor(public _http: HttpClient, public _authService: AuthService) {
    super(
      `printers`, // PATH
      _http,
      _authService,
    );
  }

  public getPrinter(_id: string): Observable<any> {
    const URL = `${Config.apiURL}printer`;

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
        }),
      );
  }

  public getPrinters(query?: string): Observable<any> {
    const URL = `${Config.apiURL}printers`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams().set('query', query);

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
        }),
      );
  }

  public getPrintersV2(
    project: {},
    match: {},
    sort: {},
    group: {},
    limit: number = 0,
    skip: number = 0,
  ): Observable<any> {
    const URL = `${Config.apiURL}v2/printers`;

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
        }),
      );
  }

  public savePrinter(printer: Printer): Observable<any> {
    const URL = `${Config.apiURL}printer`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(URL, printer, {
        headers: headers,
      })
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((err) => {
          return of(err);
        }),
      );
  }

  public updatePrinter(printer: Printer): Observable<any> {
    const URL = `${Config.apiURL}printer`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams().set('id', printer._id);

    return this._http
      .put(URL, printer, {
        headers: headers,
        params: params,
      })
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((err) => {
          return of(err);
        }),
      );
  }

  public deletePrinter(_id: string): Observable<any> {
    const URL = `${Config.apiURL}printer`;

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
        }),
        catchError((err) => {
          return of(err);
        }),
      );
  }
}
