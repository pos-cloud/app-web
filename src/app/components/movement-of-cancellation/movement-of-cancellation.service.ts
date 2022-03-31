import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { of } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Config } from '../../app.config';
import { MovementOfCancellation } from 'app/components/movement-of-cancellation/movement-of-cancellation';
import { AuthService } from '../login/auth.service';
import { ModelService } from '../model/model.service';

@Injectable()
export class MovementOfCancellationService extends ModelService {

  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {
    super(
      `movements-of-cancellations`, // PATH
      _http,
      _authService
    );
  }

  public getMovementsOfCancellations(
    project: {},
    match: {},
    sort: {},
    group: {},
    limit: number = 0,
    skip: number = 0
  ): Observable<any> {

    const URL = `${Config.apiURL}/movements-of-cancellations`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
      .set('project', JSON.stringify(project))
      .set('match', JSON.stringify(match))
      .set('sort', JSON.stringify(sort))
      .set('group', JSON.stringify(group))
      .set('limit', limit.toString())
      .set('skip', skip.toString());

    return this._http.get(URL, {
      headers: headers,
      params: params
    }).pipe(
      map(res => {
        return res;
      }),
      catchError((err) => {
        return of(err);
      })
    );
  }

  public saveMovementOfCancellation(movementOfCancellation: MovementOfCancellation): Observable<any> {

    const URL = `${Config.apiURL}movement-of-cancellation`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.post(URL, movementOfCancellation, {
      headers: headers
    }).pipe(
      map(res => {
        return res;
      }),
      catchError((err) => {
        return of(err);
      })
    );
  }

  public saveMovementsOfCancellations(movementsOfCancellations: MovementOfCancellation[]): Observable<any> {

    const URL = `${Config.apiURL}movements-of-cancellations`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.post(URL, { movementsOfCancellations: movementsOfCancellations }, {
      headers: headers
    }).pipe(
      map(res => {
        return res;
      }),
      catchError((err) => {
        return of(err);
      })
    );
  }

  public deleteMovementsOfCancellations(query: string): Observable<any> {

    const URL = `${Config.apiURL}movements-of-cancellations`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
      .set('query', query);

    return this._http.delete(URL, {
      headers: headers,
      params: params
    }).pipe(
      map(res => {
        return res;
      }),
      catchError((err) => {
        return of(err);
      })
    );
  }
}
