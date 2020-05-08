import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { of } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Config } from './../../app.config';
import { AuthService } from '../login/auth.service';
import { Address } from './address';

@Injectable()
export class AddressService {

	constructor(
        private _http: HttpClient,
		private _authService: AuthService
	) { }

    public getAddress(_id: string): Observable<any> {

        const URL = `${Config.apiURL}address`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        const params = new HttpParams()
            .set('id', _id);

        return this._http.get(URL , {
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

    public getAddresses(
        project: {},
        match: {},
        sort: {},
        group: {},
        limit: number = 0,
        skip: number = 0
    ): Observable<any> {

        const URL = `${Config.apiURL}addresses`;

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

    public saveAddress(address: Address): Observable<any> {

        const URL = `${Config.apiURL}address`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        return this._http.post(URL, address, {
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

    public updateAddress(address: Address): Observable<any> {

        const URL = `${Config.apiURL}address`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken())

        const params = new HttpParams()
            .set('id', address._id);

        return this._http.put(URL, address, {
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

    public deleteAddress(_id: string): Observable<any> {

        const URL = `${Config.apiURL}address`;

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
