import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { of } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Config } from '../../app.config';
import { AuthService } from "app/components/login/auth.service";

@Injectable()
export class MeliService {

    constructor(
        public _http: HttpClient,
        public _authService: AuthService
    ) { }

    getCategories(name: string, limit: number): Observable<any> {

        const URL = `${Config.apiV8URL}meli/categories`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        const params = new HttpParams()
            .set('name', name)
            .set('limit', limit.toString());

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

    loadAttrsByCategory(categoryId: string): Observable<any> {

        const URL = `${Config.apiV8URL}meli/attrs/${categoryId}`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        return this._http.get(URL, {
            headers: headers,
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
