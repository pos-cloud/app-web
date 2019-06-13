import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { empty } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Config } from '../app.config';
import { AuthService } from './auth.service';
import { CancellationType } from './../models/cancellation-type';

@Injectable()
export class CancellationTypeService {

	constructor(
        private _http: HttpClient,
		private _authService: AuthService
	) { }

    public getCancellationType(_id: string): Observable<any> {
        
        const URL = `${Config.apiURL}cancellation-type`;

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
                return empty();
            })
        );
    }

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

    public saveCancellationType(cancellationType: CancellationType): Observable<any> {

        const URL = `${Config.apiURL}cancellation-type`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        return this._http.post(URL, cancellationType, {
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

    public updateCancellationType(cancellationType: CancellationType): Observable<any> {
        
        const URL = `${Config.apiURL}cancellation-type`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());
        
        const params = new HttpParams()
            .set('id', cancellationType._id);

        return this._http.put(URL, cancellationType, {
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

    public deleteCancellationType(_id: string): Observable<any> {
        
        const URL = `${Config.apiURL}cancellation-type`;

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
