import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { MovementOfCancellation } from 'app/components/movement-of-cancellation/movement-of-cancellation';
import { ModelService } from 'app/core/services/model.service';
import { environment } from 'environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
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
    const URL = `${environment.api}/api/movements-of-cancellations`; // TODO:Migrar

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

  public saveMovementOfCancellation(movementOfCancellation: MovementOfCancellation): Observable<any> {
    const URL = `${environment.api}/api/movement-of-cancellation`; // TODO:Migrar

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(URL, this.toMovementPayload(movementOfCancellation), {
        headers: headers,
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

  public saveMovementsOfCancellations(movementsOfCancellations: MovementOfCancellation[]): Observable<any> {
    const URL = `${environment.api}/api/movements-of-cancellations`; // TODO:Migrar

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(
        URL,
        { movementsOfCancellations: movementsOfCancellations.map((movement) => this.toMovementPayload(movement)) },
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

  public deleteMovementsOfCancellations(query: string): Observable<any> {
    const URL = `${environment.api}/api/movements-of-cancellations`; // TODO:Migrar

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams().set('query', query);

    return this._http
      .delete(URL, {
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

  private toMovementPayload(movement: MovementOfCancellation) {
    return {
      transactionOrigin: this.entityId(movement?.transactionOrigin),
      transactionDestination: this.entityId(movement?.transactionDestination),
      type: this.entityId(movement?.type),
      balance: movement?.balance,
      creationDate: movement?.creationDate,
    };
  }

  private entityId(value: { _id?: string } | string): string | undefined {
    if (value == null || value === '') {
      return undefined;
    }
    return typeof value === 'string' ? value : value._id;
  }

  public updateByDestination(transactionDestination: string, movements: MovementOfCancellation[]): Observable<any> {
    const URL = `${environment.apiv2}/movements-of-cancellations/by-destination`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .put(
        URL,
        { transactionDestination, movements },
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
