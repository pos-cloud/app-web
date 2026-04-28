import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ModelService } from 'app/core/services/model.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PriceListArticleService extends ModelService {
  constructor(public _http: HttpClient, public _authService: AuthService) {
    super(
      `price-list-articles`, // PATH
      _http,
      _authService
    );
  }

  public getByPriceList(priceListId: string): Observable<any> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .get(`${environment.apiv2}/price-list-articles/by-price-list/${priceListId}`, { headers })
      .pipe(
        map((res) => res),
        catchError((err) => of(err))
      );
  }

  public getByArticle(articleId: string): Observable<any> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .get(`${environment.apiv2}/price-list-articles/by-article/${articleId}`, { headers })
      .pipe(
        map((res) => res),
        catchError((err) => of(err))
      );
  }

  public upsert(payload: { priceList: string; article: string; price: number }): Observable<any> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .put(`${environment.apiv2}/price-list-articles/upsert`, payload, { headers })
      .pipe(
        map((res) => res),
        catchError((err) => of(err))
      );
  }
}

