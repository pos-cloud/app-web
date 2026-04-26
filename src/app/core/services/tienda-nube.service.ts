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

  /**
   * Cambia estado de una orden en Tienda Nube.
   * `payload` es opcional: cancel/fulfilled envían datos del formulario; el listado puede mandar `{}`.
   * Credenciales (user/token) las resuelve api-core desde `applications`, no desde config.
   */
  public updateTransactionTn(orderId: string, status: any, payload?: Record<string, unknown>) {
    const URL = `${environment.apiv2}/tienda-nube/order`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const body: { orderId: string; status: any; data?: Record<string, unknown> } = { orderId, status };
    if (payload !== undefined && payload !== null) {
      body.data = payload;
    }

    return this._http
      .put(
        URL,
        body,
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
