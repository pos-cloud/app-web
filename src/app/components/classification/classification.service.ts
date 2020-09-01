import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { of } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Config } from '../../app.config';
import { Classification } from './classification';
import { AuthService } from '../login/auth.service';
import { ModelService } from '../model/model.service';

@Injectable()
export class ClassificationService extends ModelService {

  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {
    super(
      `classifications`, // PATH
      _http,
      _authService
    );
  }

	public getClassification(_id: string): Observable<any> {

		const URL = `${Config.apiURL}classification`;

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

	public getClassifications(
		project: {},
		match: {},
		sort: {},
		group: {},
		limit: number = 0,
		skip: number = 0
	): Observable<any> {

		const URL = `${Config.apiURL}classifications`;

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

	public saveClassification(classification: Classification): Observable<any> {

		const URL = `${Config.apiURL}classification`;

		const headers = new HttpHeaders()
			.set('Content-Type', 'application/json')
			.set('Authorization', this._authService.getToken());

		return this._http.post(URL, classification, {
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

	public updateClassification(classification: Classification): Observable<any> {

		const URL = `${Config.apiURL}classification`;

		const headers = new HttpHeaders()
			.set('Content-Type', 'application/json')
			.set('Authorization', this._authService.getToken())

		const params = new HttpParams()
			.set('id', classification._id);

		return this._http.put(URL, classification, {
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

	public deleteClassification(_id: string): Observable<any> {

		const URL = `${Config.apiURL}classification`;

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
		);
	}
}
