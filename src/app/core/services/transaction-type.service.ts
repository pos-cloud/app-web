import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ModelService } from 'app/core/services/model.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Config } from '../../app.config';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionTypeService extends ModelService {
  public _jsonURL = 'assets/datos/optionalAFIP.json';

  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {
    super(
      `transaction-types`, // PATH
      _http,
      _authService
    );
  }

  public getJSON(): Observable<any> {
    return this._http.get(this._jsonURL);
  }

  public getTrasactionTypes(query?: string): Observable<any> {
    const URL = `${Config.apiURL}transaction-types`;

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
