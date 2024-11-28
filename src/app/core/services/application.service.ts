import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ModelService } from 'app/core/services/model.service';
import { environment } from 'environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root',
})
export class ApplicationService extends ModelService {
  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {
    super(
      `applications`, // PATH
      _http,
      _authService
    );
  }

  public createWebhookTn(
    userId: string,
    authentication: string
  ): Observable<any> {
    const URL = `${environment.apiv2}/tienda-nube/webhook`;

    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this._http
      .post(
        URL,
        {
          userId: userId,
          authentication: authentication,
        },
        { headers: headers }
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
