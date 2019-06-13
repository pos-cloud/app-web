import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { empty } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { PaymentMethod } from './../models/payment-method';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class PaymentMethodService {

	constructor(
		private _http: HttpClient,
		private _authService: AuthService
	) { }

	public getPaymentMethod(_id: string): Observable<any> {

        const URL = `${Config.apiURL}payment-method`;

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

	public getPaymentMethods(
        query?: string
    ): Observable<any> {

        const URL = `${Config.apiURL}payment-methods`;

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

    public getPaymentMethodsV2(
        project: {},
        match: {},
        sort: {},
        group: {},
        limit: number = 0,
        skip: number = 0
    ): Observable<any> {

        const URL = `${Config.apiURL}v2/payment-methods`;

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

	public getSalesByPaymentMethod(
        query?: string
    ): Observable<any> {

        const URL = `${Config.apiURL}sales-by-payment-method`;

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

	public savePaymentMethod(paymentMethod : PaymentMethod): Observable<any> {

        const URL = `${Config.apiURL}payment-method`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        return this._http.post(URL, paymentMethod, {
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

	public updatePaymentMethod(paymentMethod: PaymentMethod): Observable<any> {

        const URL = `${Config.apiURL}payment-method`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        const params = new HttpParams()
            .set('id', paymentMethod._id);

        return this._http.put(URL, paymentMethod, {
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
	
	public deletePaymentMethod(_id: string): Observable<any> {

        const URL = `${Config.apiURL}payment-method`;

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