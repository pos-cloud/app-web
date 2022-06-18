import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Structure} from 'app/components/structure/structure';
import {environment} from 'environments/environment';
import {of} from 'rxjs';
import {Observable} from 'rxjs/Observable';
import {map, catchError} from 'rxjs/operators';

import {Config} from '../../app.config';
import {AuthService} from '../login/auth.service';
import {ModelService} from '../model/model.service';

@Injectable()
export class StructureService extends ModelService {
  constructor(public _http: HttpClient, public _authService: AuthService) {
    super(
      `structures`, // PATH
      _http,
      _authService,
    );
  }

  public getStructure(_id: string): Observable<any> {
    const URL = `${Config.apiURL}structure`;

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

  public getStructures(
    project: {},
    match: {},
    sort: {},
    group: {},
    limit: number = 0,
    skip: number = 0,
  ): Observable<any> {
    const URL = `${Config.apiURL}/structures`;

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

  public saveStructure(structure: Structure): Observable<any> {
    const URL = `${Config.apiURL}structure`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(URL, structure, {
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

  public updateStructure(structure: Structure): Observable<any> {
    const URL = `${Config.apiURL}structure`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams().set('id', structure._id);

    return this._http
      .put(URL, structure, {
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

  public deleteStructure(_id: string): Observable<any> {
    const URL = `${Config.apiURL}structure`;

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

  public updateBasePriceByStruct(): Observable<any> {
    const URL = `${environment.apiv2}/articles/update-by-structure`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(URL, null, {
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
}
