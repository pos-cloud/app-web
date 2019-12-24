import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { of } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Table } from './../models/table';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class TableService {

	constructor(
		private _http: HttpClient,
		private _authService: AuthService
	) { }

	public getTable(_id: string): Observable<any> {

		const URL = `${Config.apiURL}table`;

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

	public getTables(
		query?: string
	): Observable<any> {

		const URL = `${Config.apiURL}tables`;

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

	public getTablesV2(
		project: {},
		match: {},
		sort: {},
		group: {},
		limit: number = 0,
		skip: number = 0
	): Observable<any> {

		const URL = `${Config.apiURL}v2/tables`;

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

	public saveTable(table: Table): Observable<any> {

		const URL = `${Config.apiURL}table`;

		const headers = new HttpHeaders()
			.set('Content-Type', 'application/json')
			.set('Authorization', this._authService.getToken());

		return this._http.post(URL, table, {
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

	public updateTable(table: Table): Observable<any> {

		const URL = `${Config.apiURL}table`;

		const headers = new HttpHeaders()
			.set('Content-Type', 'application/json')
			.set('Authorization', this._authService.getToken());

		const params = new HttpParams()
			.set('id', table._id);

		return this._http.put(URL, table, {
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

	public deleteTable(_id: string): Observable<any> {

		const URL = `${Config.apiURL}table`;

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
