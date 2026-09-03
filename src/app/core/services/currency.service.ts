import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ModelService } from 'app/core/services/model.service';
import { environment } from 'environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService extends ModelService {
  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {
    super(
      `currencies`, // PATH
      _http,
      _authService
    );
  }

  public getCurrencies(query?: string): Observable<any> {
    const URL = `${environment.apiv2}/currencies`;

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
}
