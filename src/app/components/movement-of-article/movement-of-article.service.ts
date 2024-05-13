import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {of} from 'rxjs';
import {Observable} from 'rxjs/Observable';
import {map, catchError} from 'rxjs/operators';

import {Config} from '../../app.config';
import {AuthService} from '../login/auth.service';
import {ModelService} from '../model/model.service';

import {MovementOfArticle} from './movement-of-article';
import { environment } from 'environments/environment';

@Injectable()
export class MovementOfArticleService extends ModelService {
  constructor(_http: HttpClient, _authService: AuthService) {
    super(
      `movements-of-articles`, // PATH
      _http,
      _authService,
    );
  }

  getMovementOfArticle(_id: string): Observable<any> {
    const URL = `${Config.apiURL}"movement-of-field`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams().set('id', _id);

    return this._http
      .get(URL, {
        headers: headers,
        params: params,
      })
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((err) => {
          return of(err);
        }),
      );
  }

  getMovementsOfArticles(query?: string): Observable<any> {
    const URL = `${Config.apiURL}movements-of-articles`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams().set('query', query);

    return this._http
      .get(URL, {
        headers: headers,
        params: params,
      })
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((err) => {
          return of(err);
        }),
      );
  }

  getMovementsOfArticlesV2(
    project: {},
    match: {},
    sort: {},
    group: {},
    limit: number = 0,
    skip: number = 0,
  ): Observable<any> {
    const URL = `${Config.apiURL}v2/movements-of-articles`;

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

    return this._http
      .get(URL, {
        headers: headers,
        params: params,
      })
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((err) => {
          return of(err);
        }),
      );
  }

  getMovementsOfArticlesV3(query): Observable<any> {
    const URL = `${Config.apiURL}v3/movements-of-articles`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(URL, query, {
        headers: headers,
      })
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((err) => {
          return of(err);
        }),
      );
  }

  saveMovementOfArticle(movementOfArticle: MovementOfArticle): Observable<any> {
    const URL = `${Config.apiURL}movement-of-article`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(URL, movementOfArticle, {
        headers: headers,
      })
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((err) => {
          return of(err);
        }),
      );
  }

  saveMovementsOfArticles(movementsOfArticles: MovementOfArticle[]): Observable<any> {
    const URL = `${Config.apiURL}movements-of-articles`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(
        URL,
        {movementsOfArticles: movementsOfArticles},
        {
          headers: headers,
        },
      )
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((err) => {
          return of(err);
        }),
      );
  }

  updateMovementOfArticle(movementOfArticle: MovementOfArticle): Observable<any> {
    const URL = `${Config.apiURL}movement-of-article`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams().set('id', movementOfArticle._id);

    return this._http
      .put(URL, movementOfArticle, {
        headers: headers,
        params: params,
      })
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((err) => {
          return of(err);
        }),
      );
  }

  updateMovementOfArticleByWhere(where: {}, set: {}, sort: {}): Observable<any> {
    const URL = `${Config.apiURL}movement-of-article-by-where`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
      .set('where', JSON.stringify(where))
      .set('set', JSON.stringify(set))
      .set('sort', JSON.stringify(sort));

    return this._http
      .put(URL, null, {
        headers: headers,
        params: params,
      })
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((err) => {
          return of(err);
        }),
      );
  }

  updateMovementsOfArticlesByWhere(where: {}, set: {}, sort: {}): Observable<any> {
    const URL = `${Config.apiURL}movements-of-articles-by-where`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
      .set('where', JSON.stringify(where))
      .set('set', JSON.stringify(set))
      .set('sort', JSON.stringify(sort));

    return this._http
      .put(URL, null, {
        headers: headers,
        params: params,
      })
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((err) => {
          return of(err);
        }),
      );
  }

  deleteMovementsOfArticles(query: string): Observable<any> {
    const URL = `${Config.apiURL}movements-of-articles`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams().set('query', query);

    return this._http
      .delete(URL, {
        headers: headers,
        params: params,
      })
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((err) => {
          return of(err);
        }),
      );
  }

  public updateMovementOfArticles(transactionId: string): Observable<any> {
    const URL = `${environment.apiv2}/movements-of-articles/update-by-transaction/${transactionId}`;

    const headers = new HttpHeaders()
      .set("Content-Type", "application/json")
      .set("Authorization", this._authService.getToken());

      console.log(headers)

    return this._http
      .put(URL,{}, {
        headers: headers,
      })
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((err) => {
          return of(err);
        })
      );
  }

  public getMovOfArticleByTransaction(transactionTypeId: string): Observable<any>{
    const URL = `${environment.apiv2}/movements-of-articles/articles-by-transaction/${transactionTypeId}`;

    const headers = new HttpHeaders()
      .set("Content-Type", "application/json")
      .set("Authorization", this._authService.getToken());

    return this._http
      .get(URL,
        { headers: headers })
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((err) => {
          return of(err);
        })
      );
  }
}
