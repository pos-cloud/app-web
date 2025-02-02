import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { AuthService } from 'app/core/services/auth.service';

@Injectable()
export class MovArtByCategoryService {
  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {}

  public getMovArtByCategory(data: {}): Observable<any> {
    const URL = `${environment.apiv2}/reports-system/mov-art-by-category`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(URL, data, {
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

  public getReportSystem(data: {}): Observable<any> {
    const URL = `${environment.apiv2}/reports-system/${data['reportType']}`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(URL, data, {
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
}
