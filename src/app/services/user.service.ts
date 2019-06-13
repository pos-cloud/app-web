import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { empty } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { User } from './../models/user';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class UserService {

  constructor(
		private _http: HttpClient,
		private _authService: AuthService
	) { }

	public getUser(_id: string): Observable<any> {

    const URL = `${Config.apiURL}user`;

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
            return empty();
        })
    );
  }

  public getUsers(
    query?: string
  ): Observable<any> {

    const URL = `${Config.apiURL}users`;

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
            return empty();
        })
    );
  }

  public getUsersV2(
    project: {},
    match: {},
    sort: {},
    group: {},
    limit: number = 0,
    skip: number = 0
  ): Observable<any> {

    const URL = `${Config.apiURL}v2/users`;

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
            return empty();
        })
    );
  }

  public saveUser(user: User): Observable<any> {

    const URL = `${Config.apiURL}user`;

    const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', this._authService.getToken());

    return this._http.post(URL, user, {
        headers: headers
    }).pipe(
        map(res => {
            return res;
        }),
        catchError((err) => {
            return empty();
        })
    );
  }

  public updateUser(user: User): Observable<any> {

    const URL = `${Config.apiURL}user`;

    const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
        .set('id', user._id);

    return this._http.put(URL, user, {
        headers: headers,
        params: params
    }).pipe(
        map(res => {
            return res;
        }),
        catchError((err) => {
            return empty();
        })
    );
  }

  public deleteUser(_id: string): Observable<any> {

    const URL = `${Config.apiURL}user`;

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
            return empty();
        })
    );
  }
}
