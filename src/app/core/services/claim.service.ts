import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Claim } from '@types';
import { ModelService } from 'app/core/services/model.service';
import { AuthService } from '../../core/services/auth.service';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ClaimService extends ModelService {
  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {
    super(
      `claims`, // PATH
      _http,
      _authService
    );
  }

  public saveClaim(claim: Claim): Observable<any> {
    const URL = `${environment.api}/api/claim`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());
    return this._http
      .post(
        URL,
        { claim: claim },
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
