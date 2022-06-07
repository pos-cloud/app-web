import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {of} from 'rxjs';
import {Observable} from 'rxjs/Observable';
import {map, catchError} from 'rxjs/operators';

import {Config} from '../../app.config';
import {AuthService} from '../login/auth.service';
import {ModelService} from '../model/model.service';

@Injectable()
export class BusinessRuleService extends ModelService {
  constructor(public _http: HttpClient, public _authService: AuthService) {
    super(
      `business-rules`, // PATH
      _http,
      _authService,
    );
  }

  apply(code: string, transactionId: string): Observable<any> {
    const URL = `${Config.apiV8URL}business-rules/apply`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.post(URL, {code, transactionId}, {headers}).pipe(
      map((res) => {
        return res;
      }),
      catchError((err) => {
        return of(err);
      }),
    );
  }
}
