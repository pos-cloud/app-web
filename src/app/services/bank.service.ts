import { Injectable } from '@angular/core';

import { Config } from '../app.config';
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { Bank } from './../models/bank';
import { AuthService } from './auth.service';


import { Http, Headers } from '@angular/http';

@Injectable()
export class BankService {

	constructor(
        public _http: Http,
        private http: HttpClient,
		public _authService: AuthService
	) { }

    public getBanks(
        project: {},
        match: {},
        sort: {},
        group: {},
        limit: number = 0,
        skip: number = 0
    ): Observable<any> {

        const URL = `${Config.apiURL}/banks`;

        const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', this._authService.getToken());
        //.set('Authorization', this._authService.getSession()["token"]);

        const params = new HttpParams()
        .set('project', JSON.stringify(project))
        .set('match', JSON.stringify(match))
        .set('sort', JSON.stringify(sort))
        .set('group', JSON.stringify(group))
        .set('limit', limit.toString())
        .set('skip', skip.toString());

        return this.http.get(URL, {
        headers: headers,
        params: params
        }).pipe(
            map(res => {
                return res;
            })
        );
    }

    public addBank( bank: Bank): Observable<any> {
		let headers = new Headers({
		'Content-Type': 'application/json',
				'Authorization': this._authService.getToken()
    });
		return this._http.post(Config.apiURL + "bank", bank, { headers: headers }).map (res => res.json());
    }

    public updateBank(bank: Bank): Observable<any> {
        
        const URL = `${Config.apiURL}bank`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken())
        
        const params = new HttpParams()
            .set('id', bank._id);

        return this.http.put(URL, bank, {
            headers: headers,
            params: params
        }).pipe(
            map(res => {
                return res;
            }),
        );
    }

    public deleteBank(bankId: string): Observable<any> {
        
        const URL = `${Config.apiURL}bank`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken())
        
        const params = new HttpParams()
            .set('id', bankId);

        return this.http.delete(URL, {
            headers: headers,
            params: params
        }).pipe(
            map(res => {
                return res;
            }),
        );
    }

    public getBank(bankId: string): Observable<any> {
        
        const URL = `${Config.apiURL}bank`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());
        
        const params = new HttpParams()
            .set('id', bankId);

        return this.http.get(URL , {
            headers: headers,
            params: params
        }).pipe(
            map(res => {
                return res;
            }),
        );
    }
}
