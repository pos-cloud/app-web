import { Injectable } from "@angular/core";
import { ModelService } from '../model/model.service';
import { AuthService } from '../login/auth.service';
import { Observable, of} from "rxjs";
import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import {Config} from '../../app.config';
import {map, catchError} from 'rxjs/operators';

@Injectable()
export class ShipmentMethodService extends ModelService {

  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {
    super(
      `shipment-methods`, // PATH
      _http,
      _authService
    );
  }

  public getShipmentMethods(query?: string): Observable<any> {
    const URL = `${Config.apiV8URL}shipment-methods`;

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
        }),
      );
  }

}
