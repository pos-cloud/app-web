import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AuthService } from 'app/core/services/auth.service';
import { ModelService } from 'app/core/services/model.service';
import { environment } from 'environments/environment';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GalleryService extends ModelService {
  constructor(public _http: HttpClient, public _authService: AuthService) {
    super(
      `galleries`, // PATH
      _http,
      _authService
    );
  }

  public findArticle(search: string): Observable<any> {
    const URL = `${environment.apiv2}/galleries/find-article`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams().set('filter', search);

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
