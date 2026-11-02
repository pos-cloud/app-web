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
export class TableService extends ModelService {
  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {
    super(
      `tables`, // PATH
      _http,
      _authService
    );
  }

  public getTableObjById(id: string): Observable<any> {
    const URL = `${environment.apiv2}/tables/object/${id}`;
console.log(URL);
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
