import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from 'environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class WooCommerceService {
  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {}

  public syncWoo(): Observable<any> {
    const URL = `${environment.apiv2}/woo/sync/products`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(URL, null, {
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

  public updateTransactionStatusWoo(wooId: string, status: string) {
    const URL = `${environment.apiv2}/woo/orders/status`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    let data = {
      wooId,
      status,
    };

    return this._http.put(`${URL}`, data, { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError((err) => {
        return of(err);
      })
    );
  }

  public syncOrders(data: { fromDate: string; toDate: string }): Observable<any> {
    const URL = `${environment.apiv2}/woo/sync/orders`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.post(URL, data, { headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError((err) => {
        return of(err);
      })
    );
  }
}
