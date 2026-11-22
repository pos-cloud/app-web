import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MovementOfArticle } from 'app/components/movement-of-article/movement-of-article';
import { MovementOfCash } from 'app/components/movement-of-cash/movement-of-cash';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ModelService } from 'app/core/services/model.service';
import { Config } from '../../app.config';
import { AuthService } from './auth.service';

import { environment } from 'environments/environment';
import { Transaction } from '../../components/transaction/transaction';

@Injectable({
  providedIn: 'root',
})
export class TransactionService extends ModelService {
  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {
    super(
      `transactions`, // PATH
      _http,
      _authService
    );
  }

  public getTransaction(_id: string): Observable<any> {
    const URL = `${environment.api}/api/transaction`; // TODO:Migrar

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

  public getTransactions(query?: string): Observable<any> {
    const URL = `${environment.api}/api/transactions`; // TODO:Migrar

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

  /** Vista de transacción: transaction + artículos + caja + cancelaciones en una llamada. */
  public getView(id: string): Observable<any> {
    const URL = `${environment.apiv2}/transactions/view/${id}`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.get(URL, { headers }).pipe(
      map((res) => res),
      catchError((err) => of(err))
    );
  }

  /** Pendientes de stock. El listado completo llega junto; la página la arma el front. */
  public getPendingStock(): Observable<any> {
    const URL = `${environment.apiv2}/transactions/pos/stock`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.get(URL, { headers }).pipe(
      map((res) => res),
      catchError((err) => of(err))
    );
  }

  /** Pendientes de producción. El listado completo llega junto; la página la arma el front. */
  public getPendingProduction(): Observable<any> {
    const URL = `${environment.apiv2}/transactions/pos/production`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.get(URL, { headers }).pipe(
      map((res) => res),
      catchError((err) => of(err))
    );
  }

  /** Próximo número de comprobante (api-v2). Cuando migremos a contadores no hay que tocar el front. */
  public getNextNumber(type: string, origin: number, letter: string, excludeId?: string): Observable<any> {
    const URL = `${environment.apiv2}/transactions/next-number`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    let params = new HttpParams()
      .set('type', type)
      .set('origin', String(origin ?? 0))
      .set('letter', letter ?? '');

    if (excludeId) {
      params = params.set('excludeId', excludeId);
    }

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

  public validateElectronicTransactionAR(transaction: Transaction, canceledTransactions): Observable<any> {
    const URL = `${environment.apiv2}/transactions/validate-electronic/${transaction._id}`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(
        URL,
        { canceledTransactions },
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

  public syncTransactionFromArca(transactionId: string): Observable<any> {
    const URL = `${environment.apiv2}/transactions/sync-from-arca/${transactionId}`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.post(URL, {}, { headers }).pipe(
      map((res) => res),
      catchError((err) => of(err))
    );
  }

  public validateElectronicTransactionMX(
    transaction: Transaction,
    movementsOfArticles: MovementOfArticle[],
    movementsOfCashes: MovementOfCash[]
  ): Observable<any> {
    const URL = `http://vps-1883265-x.dattaweb.com/libs/fe/mx/01_CFDI_fe.php`;

    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

    const database = localStorage.getItem('company') || '';

    let body =
      'transaction=' +
      JSON.stringify(transaction) +
      '&' +
      'movementsOfArticles=' +
      JSON.stringify(movementsOfArticles) +
      '&' +
      'movementsOfCashes=' +
      JSON.stringify(movementsOfCashes) +
      '&' +
      'config=' +
      '{"companyIdentificationValue":"' +
      Config.companyIdentificationValue +
      '","vatCondition":' +
      Config.companyVatCondition.code +
      ',"companyName":"' +
      Config.companyName +
      '","companyPostalCode":"' +
      Config.companyPostalCode +
      '","database":"' +
      database +
      '"}';

    return this._http
      .post(URL, body, {
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

  public updateBalance(transaction: Transaction): Observable<any> {
    const URL = `${environment.apiv2}/transactions/update-balance/${transaction._id}`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .put(URL, transaction, {
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

  public setOrderNumber(transaction: Transaction): Observable<any> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(
        `${environment.apiv2}set-order-number/`,
        { transaction: transaction },
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

  public generateSubscriptions(vatPeriod): Observable<any> {
    const URL = `${environment.apiv2}/transactions/subscription`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.post(URL, { vatPeriod }, { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError((err) => {
        return of(err);
      })
    );
  }

  public transactionByTextract(textract: unknown, transactionId: string): Observable<any> {
    const URL = `${environment.apiv2}/transactions/by-textract/${transactionId}`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.post(URL, { textract }, { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError((err) => {
        return of(err);
      })
    );
  }

  public recalculateTaxes(transaction: Transaction | any): Observable<any> {
    const URL = `${environment.apiv2}/transactions/recalculate-taxes`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.post(URL, { transaction }, { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError((err) => {
        return of(err);
      })
    );
  }
}
