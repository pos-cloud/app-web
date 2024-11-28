import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ModelService } from 'app/core/services/model.service';
import { environment } from 'environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TransactionStateTiendaNube } from '../../components/transaction/transaction';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TiendaNubeService extends ModelService {
  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {
    super(
      `tiendaNube`, // PATH
      _http,
      _authService
    );
  }

  public updateTransactionStatus(orderId: string, data: any, status: any) {
    const URL = `${environment.apiTiendaNube}/orders/${orderId}`;
    let statusEndpoint: string;
    let payload: any;

    switch (status) {
      case TransactionStateTiendaNube.Open:
        statusEndpoint = 'open';
        payload = { storeId: data };
        break;
      case TransactionStateTiendaNube.Closed:
        statusEndpoint = 'close';
        payload = { storeId: data };
        break;
      case TransactionStateTiendaNube.Canceled:
        statusEndpoint = 'cancel';
        payload = data;
        break;
      case TransactionStateTiendaNube.Packed:
        statusEndpoint = 'pack';
        payload = { storeId: data };
        break;
      case TransactionStateTiendaNube.Fulfilled:
        statusEndpoint = 'fulfill';
        payload = data;
        break;
    }

    return this._http.post(`${URL}/${statusEndpoint}`, payload).pipe(
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
