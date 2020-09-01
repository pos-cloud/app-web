import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { of } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Config } from '../../app.config';
import { AuthService } from '../login/auth.service';
import { Voucher } from './voucher';
import { ModelService } from '../model/model.service';

@Injectable()
export class VoucherService extends ModelService {

  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {
    super(
      `vouchers`, // PATH
      _http,
      _authService
    );
  }

	public getVoucher(_id: string): Observable<any> {

		const URL = `${Config.apiURL}voucher`;

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

	public getVouchers(
		query?: string
	): Observable<any> {

		const URL = `${Config.apiURL}vouchers`;

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

	public getVouchersV2(
		project: {},
		match: {},
		sort: {},
		group: {},
		limit: number = 0,
		skip: number = 0
	): Observable<any> {

		const URL = `${Config.apiURL}v2/vouchers`;

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

	public saveVoucher(voucher: Voucher): Observable<any> {

		const URL = `${Config.apiURL}voucher`;

		const headers = new HttpHeaders()
			.set('Content-Type', 'application/json')
			.set('Authorization', this._authService.getToken());

		return this._http.post(URL, voucher, {
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

	public updateVoucher(voucher: Voucher): Observable<any> {

		const URL = `${Config.apiURL}voucher`;

		const headers = new HttpHeaders()
			.set('Content-Type', 'application/json')
			.set('Authorization', this._authService.getToken());

		const params = new HttpParams()
			.set('id', voucher._id);

		return this._http.put(URL, voucher, {
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

	public generateVoucher(voucher: {}): Observable<any> {

		const URL = `${Config.apiURL}generate-voucher`;

		const headers = new HttpHeaders()
			.set('Content-Type', 'application/json')
			.set('Authorization', this._authService.getToken());

		return this._http.post(URL, { voucher: voucher }, {
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

	public verifyVoucher(voucher: string): Observable<any> {

		const URL = `${Config.apiURL}verify-voucher`;

		const headers = new HttpHeaders()
			.set('Content-Type', 'application/json')
			.set('Authorization', this._authService.getToken());

		return this._http.post(URL, { voucher: voucher }, {
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
}
