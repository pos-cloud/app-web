import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { empty } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { ArticleField } from './../models/article-field';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class ArticleFieldService {

	constructor(
		private _http: HttpClient,
		private _authService: AuthService
	) { }

	public getArticleField(_id: string): Observable<any> {

        const URL = `${Config.apiURL}article-field`;

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

    public getArticleFields(
        query?: string
    ): Observable<any> {

        const URL = `${Config.apiURL}article-fields`;

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

    public getArticleFieldsV2(
        project: {},
        match: {},
        sort: {},
        group: {},
        limit: number = 0,
        skip: number = 0
    ): Observable<any> {

        const URL = `${Config.apiURL}v2/article-fields`;

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

    public saveArticleField(articleField: ArticleField): Observable<any> {

        const URL = `${Config.apiURL}article`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        return this._http.post(URL, articleField, {
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

    public updateArticleField(articleField: ArticleField): Observable<any> {

        const URL = `${Config.apiURL}article-field`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        const params = new HttpParams()
            .set('id', articleField._id);

        return this._http.put(URL, articleField, {
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

    public deleteArticleField(_id: string): Observable<any> {

        const URL = `${Config.apiURL}article-field`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')

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
