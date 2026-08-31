import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ModelService } from 'app/core/services/model.service';
import { environment } from 'environments/environment';
import { CashBox } from '../../components/cash-box/cash-box';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class CashBoxService extends ModelService {
  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {
    super(
      `cash-boxes`, // PATH
      _http,
      _authService
    );
  }

  public getCashBoxes(query?: string): Observable<any> {
    const URL = `${environment.api}/api/cash-boxes`;

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
        })
      );
  }

  public availableCashBox(isOpen: boolean): Observable<any> {
    const URL = `${this.URL}/available-cash-box`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(
        URL,
        { isOpen },
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

  public openCashBox(movementsOfCashes: any[], transactionTypeId: string): Observable<any> {
    const URL = `${this.URL}/open-cash-box`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(
        URL,
        { movementsOfCashes, transactionTypeId },
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

  public closeCashBox(movementsOfCashes: any[], transactionTypeId: string): Observable<any> {
    const URL = `${this.URL}/close-cash-box`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(
        URL,
        { movementsOfCashes, transactionTypeId },
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

  public transferCashBox(
    movementsOfCashes: any[],
    transactionTypeId: string,
    cashBoxOriginId: string,
    cashBoxDestinationId: string
  ): Observable<any> {
    const URL = `${this.URL}/transfer-cash-box`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(
        URL,
        { movementsOfCashes, transactionTypeId, cashBoxOriginId, cashBoxDestinationId },
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

  public getClosingCashBox(_id: string): Observable<any> {
    const URL = `${environment.api}/api/get-closing-cash-box`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams().set('id', _id);

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

  public saveCashBox(cashBox: CashBox): Observable<any> {
    const URL = `${environment.api}/api/cash-box`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(URL, cashBox, {
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

  public updateCashBox(cashBox: CashBox): Observable<any> {
    const URL = `${environment.api}/api/cash-box`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams().set('id', cashBox._id);

    return this._http
      .put(URL, cashBox, {
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
