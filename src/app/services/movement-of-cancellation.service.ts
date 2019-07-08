import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { of } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Config } from '../app.config';
import { MovementOfCancellation } from 'app/models/movement-of-cancellation';
import { AuthService } from './auth.service';

@Injectable()
export class MovementOfCancellationService {

	constructor(
		private _http: HttpClient,
		private _authService: AuthService
    ) { }

    public getMovementOfCancellation(_id: string): Observable<any> {

        const URL = `${Config.apiURL}movement-of-cancellation`;

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

    public getMovementsOfCancellations(
        project: {},
        match: {},
        sort: {},
        group: {},
        limit: number = 0,
        skip: number = 0
    ): Observable<any> {

        const URL = `${Config.apiURL}/movements-of-cancellations`;

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

    public saveMovementOfCancellation (movementOfCancellation: MovementOfCancellation): Observable<any> {

        const URL = `${Config.apiURL}movement-of-cancellation`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        return this._http.post(URL, movementOfCancellation, {
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

    public saveMovementsOfCancellations(movementsOfCancellations: MovementOfCancellation[]): Observable<any> {

        const URL = `${Config.apiURL}movements-of-cancellations`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        return this._http.post(URL, { movementsOfCancellations: movementsOfCancellations }, {
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

    public updateMovementOfCancellation(movementOfCancellation: MovementOfCancellation): Observable<any> {

        const URL = `${Config.apiURL}movement-of-cancellation`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        const params = new HttpParams()
            .set('id', movementOfCancellation._id);

        return this._http.put(URL, movementOfCancellation, {
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

    public deleteMovementOfCancellation(_id: string): Observable<any> {

        const URL = `${Config.apiURL}movement-of-cancellation`;

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

    public deleteMovementsOfCancellations(query: string): Observable<any> {

        const URL = `${Config.apiURL}movements-of-cancellations`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        const params = new HttpParams()
            .set('query', query);

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
