import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ModelService } from 'app/core/services/model.service';
import { environment } from 'environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class StructureService extends ModelService {
  constructor(public _http: HttpClient, public _authService: AuthService) {
    super(
      `structures`, // PATH
      _http,
      _authService
    );
  }

  public updateBasePriceByStruct(): Observable<any> {
    const URL = `${environment.apiv2}/articles/update-by-structure`;

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

  getStructureObjById(id: string): Observable<any> {
    const URL = `${environment.apiv2}/structures/object/${id}`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.get(URL, { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError((err) => {
        return of(err);
      })
    );
  }
}
