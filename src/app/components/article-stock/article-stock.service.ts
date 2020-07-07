import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { of } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { ArticleStock } from './article-stock';
import { Article } from '../article/article';
import { Config } from '../../app.config';
import { AuthService } from '../login/auth.service';
import { MovementOfArticle } from 'app/components/movement-of-article/movement-of-article';

@Injectable()
export class ArticleStockService {

  constructor(
    private _http: HttpClient,
    private _authService: AuthService
  ) { }

  public getArticleStock(_id: string): Observable<any> {

    const URL = `${Config.apiURL}article-stock`;

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

  public getArticleStocks(
    query?: string
  ): Observable<any> {

    const URL = `${Config.apiURL}article-stocks`;

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

  public getArticleStocksV2(
    project: {},
    match: {},
    sort: {},
    group: {},
    limit: number = 0,
    skip: number = 0
  ): Observable<any> {

    const URL = `${Config.apiURL}v2/article-stocks`;

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

  public saveArticleStock(articleStock: ArticleStock): Observable<any> {

    const URL = `${Config.apiURL}article-stock`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.post(URL, articleStock, {
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

  public updateArticleStock(articleStock: ArticleStock): Observable<any> {

    const URL = `${Config.apiURL}article-stock`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
      .set('id', articleStock._id);

    return this._http.put(URL, articleStock, {
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

  public updateRealStock(movementOfArticle: MovementOfArticle): Observable<any> {

    const URL = `${Config.apiURL}amount-stock-by-article`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.put(URL, {
      movementOfArticle: movementOfArticle
    }, {
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

  public updateObjByArticle(movementOfArticle: MovementOfArticle): Observable<any> {

    const URL = `${Config.apiV8URL}stock/by-article`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.put(URL, {
      movementOfArticle: movementOfArticle
    }, {
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

  public deleteArticleStock(_id: string): Observable<any> {

    const URL = `${Config.apiURL}article-stock`;

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

  public updateArticle()
    : Observable<any> {

    const URL = `${Config.apiURL}distribuidoragiletta/update-article`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.post(URL, {
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
