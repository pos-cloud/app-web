import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ModelService } from 'app/core/services/model.service';
import { environment } from 'environments/environment';
import { Transaction } from '../../components/transaction/transaction';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ArticleStockService extends ModelService {
  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {
    super(
      `article-stocks`, // PATH
      _http,
      _authService
    );
  }

  public getArticleStocks(query?: string): Observable<any> {
    const URL = `${environment.api}/api/article-stocks`;

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

  public updateStockByTransaction(transaction: Transaction | any): Observable<any> {
    const URL = `${environment.apiv2}/stock/by-transaction`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .put(
        URL,
        {
          transaction: transaction,
        },
        {
          headers: headers,
        }
      )
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
