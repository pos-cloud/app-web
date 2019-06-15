import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { of } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { VariantType } from './../models/variant-type';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class VariantTypeService {

  constructor(
		private _http: HttpClient,
		private _authService: AuthService
	) { }

	public getVariantType(_id: string): Observable<any> {

    const URL = `${Config.apiURL}variant-type`;

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

  public getVariantTypes(
    query?: string
  ): Observable<any> {

    const URL = `${Config.apiURL}variant-types`;

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

  public getVariantTypesV2(
    project: {},
    match: {},
    sort: {},
    group: {},
    limit: number = 0,
    skip: number = 0
  ): Observable<any> {

    const URL = `${Config.apiURL}v2/variant-types`;

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

  public saveVariantType(variantType: VariantType): Observable<any> {

    const URL = `${Config.apiURL}variant-type`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.post(URL, variantType, {
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

  public updateVariantType(variantType: VariantType): Observable<any> {

    const URL = `${Config.apiURL}variant-type`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
      .set('id', variantType._id);

    return this._http.put(URL, variantType, {
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

  public deleteVariantType(_id: string): Observable<any> {

    const URL = `${Config.apiURL}variant-type`;

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
