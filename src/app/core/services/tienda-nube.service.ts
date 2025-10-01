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
export class TiendaNubeService extends ModelService {
  constructor(public _http: HttpClient, public _authService: AuthService) {
    super(
      `tiendaNube`, // PATH
      _http,
      _authService
    );
  }

  public updateTransactionTn(orderId: string, data: any, status: any) {
    const URL = `${environment.apiv2}/tienda-nube/order`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .put(
        URL,
        { data, orderId, status },
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

  public syncTiendaNube(value): Observable<any> {
    const URL = `${environment.apiv2}/tienda-nube/order`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.post(URL, { date: value }, { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError((err) => {
        return of(err);
      })
    );
  }
}
