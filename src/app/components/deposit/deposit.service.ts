import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { of } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Deposit } from './deposit';
import { Config } from '../../app.config';
import { AuthService } from '../login/auth.service';

@Injectable()
export class DepositService {

	constructor(
		private _http: HttpClient,
		private _authService: AuthService
	) { }

	public getDeposit(_id: string): Observable<any> {

		const URL = `${Config.apiURL}deposit`;

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

	public getDeposits(
		query?: string
	): Observable<any> {

		const URL = `${Config.apiURL}deposits`;

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

	public getDepositsV2(
		project: {},
		match: {},
		sort: {},
		group: {},
		limit: number = 0,
		skip: number = 0
	): Observable<any> {

		const URL = `${Config.apiURL}v2/deposits`;

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

	public saveDeposit(deposit: Deposit): Observable<any> {

		const URL = `${Config.apiURL}deposit`;

		const headers = new HttpHeaders()
			.set('Content-Type', 'application/json')
			.set('Authorization', this._authService.getToken());

		return this._http.post(URL, deposit, {
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

	public updateDeposit(deposit: Deposit): Observable<any> {

		const URL = `${Config.apiURL}deposit`;

		const headers = new HttpHeaders()
			.set('Content-Type', 'application/json')
			.set('Authorization', this._authService.getToken());

		const params = new HttpParams()
			.set('id', deposit._id);

		return this._http.put(URL, deposit, {
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

	public deleteDeposit(_id: string): Observable<any> {

		const URL = `${Config.apiURL}deposit`;

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