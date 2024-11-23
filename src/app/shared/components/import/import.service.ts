import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { catchError, map } from 'rxjs/operators';

import { AuthService } from 'app/core/services/auth.service';
import { environment } from 'environments/environment';

@Injectable()
export class ImportService {
  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {}

  public importStock(
    file: File,
    depositId: string,
    branchId: string,
    updatePrice: boolean
  ): Observable<any> {
    const URL = `${environment.apiv2}/article-stocks/import-excel`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('depositId', depositId);
    formData.append('branchId', branchId);
    formData.append('updatePrice', String(updatePrice));

    const headers = new HttpHeaders().set(
      'Authorization',
      this._authService.getToken()
    );

    return this._http
      .post(URL, formData, {
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

  public importArticle(file: File) {
    const URL = `${environment.apiv2}/articles/import-excel`;

    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders().set(
      'Authorization',
      this._authService.getToken()
    );

    return this._http
      .post(URL, formData, {
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

  public importCompany(file: File) {
    const URL = `${environment.apiv2}/companies/import-excel`;

    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders().set(
      'Authorization',
      this._authService.getToken()
    );

    return this._http
      .post(URL, formData, {
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
