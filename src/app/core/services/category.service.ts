import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ModelService } from 'app/core/services/model.service';
import { AuthService } from './auth.service';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoryService extends ModelService {
  constructor(public _http: HttpClient, public _authService: AuthService) {
    super(
      `categories`, // PATH
      _http,
      _authService
    );
  }

  public getCategories(query?: string): Observable<any> {
    const URL = `${environment.api}/api/categories`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams().set('query', query ?? '');

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
        })
      );
  }

  public getSalesByCategory(query: string): Observable<any> {
    const URL = `${environment.api}/api/sales-by-category`;

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
        })
      );
  }

  public getCategoriesByTransaction(transactionId: string): Observable<any> {
    const URL = `${environment.apiv2}/categories/by-transaction/${transactionId}`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .get(URL, { headers })
      .pipe(
        map((res) => res),
        catchError((err) => of(err))
      );
  }

  public browseByTransaction(
    transactionId: string,
    params?: { parentId?: string; limit?: number }
  ): Observable<any> {
    const URL = `${environment.apiv2}/categories/by-transaction/${transactionId}/browse`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    let httpParams = new HttpParams();
    if (params?.parentId) httpParams = httpParams.set('parentId', params.parentId);
    if (params?.limit != null) httpParams = httpParams.set('limit', String(params.limit));

    return this._http
      .get(URL, { headers, params: httpParams })
      .pipe(
        map((res) => res),
        catchError((err) => of(err))
      );
  }
}
