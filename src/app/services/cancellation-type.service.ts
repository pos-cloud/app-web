import { Injectable } from '@angular/core';

import { Config } from '../app.config';
import { AuthService } from './auth.service';
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { CancellationType } from './../models/cancellation-type';


import { Http, Headers } from '@angular/http';

@Injectable()
export class CancellationTypeService {

	constructor(
        public _http: Http,
        private http: HttpClient,
		public _authService: AuthService
	) { }

    public getCancellationTypes(
        project: {},
        match: {},
        sort: {},
        group: {},
        limit: number = 0,
        skip: number = 0
    ): Observable<any> {

        const URL = `${Config.apiURL}/cancellation-types`;

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

    public addCancellationType( cancellationType: CancellationType,): Observable<any> {
		let headers = new Headers({
		'Content-Type': 'application/json',
				'Authorization': this._authService.getToken()
    });
		return this._http.post(Config.apiURL + "cancellation-type", cancellationType, { headers: headers }).map (res => res.json());
    }

    public updateCancellationType(cancellationType: CancellationType): Observable<any> {
        
        const URL = `${Config.apiURL}cancellation-type`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken())
        
        const params = new HttpParams()
            .set('id', cancellationType._id);

        return this.http.put(URL, cancellationType, {
            headers: headers,
            params: params
        }).pipe(
            map(res => {
                return res;
            }),
        );
    }

    public deleteCancellationType(cancellationTypeId: string): Observable<any> {
        
        const URL = `${Config.apiURL}cancellation-type`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken())
        
        const params = new HttpParams()
            .set('id', cancellationTypeId);

        return this.http.delete(URL, {
            headers: headers,
            params: params
        }).pipe(
            map(res => {
                return res;
            }),
        );
    }

    public getCancellationType(cancellationTypeId: string): Observable<any> {
        
        const URL = `${Config.apiURL}cancellation-type`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());
        
        const params = new HttpParams()
            .set('id', cancellationTypeId);

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
