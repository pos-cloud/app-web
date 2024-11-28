import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from 'environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {}

  public getMenu(database: string): Observable<any> {
    const URL = `${environment.apiv2}/menu/${database}`;

    return this._http.get(URL, {}).pipe(
      map((res) => {
        return res;
      }),
      catchError((err) => {
        return of(err);
      })
    );
  }
}
