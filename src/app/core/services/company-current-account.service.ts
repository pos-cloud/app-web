import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { ModelService } from './model.service';

@Injectable({
  providedIn: 'root',
})
export class CompanyCurrentAccountService extends ModelService {
  constructor(public _http: HttpClient, public _authService: AuthService) {
    super(
      `company-current-accounts`, // PATH
      _http,
      _authService
    );
  }

  public recalculate(): Observable<any> {
    const URL = `${this.URL}/recalculate`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .put(
        URL,
        {},
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
