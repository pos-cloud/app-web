import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MovementOfArticle } from 'app/components/movement-of-article/movement-of-article';
import { MovementOfCash } from 'app/components/movement-of-cash/movement-of-cash';
import { of } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { catchError, map } from 'rxjs/operators';

import { ModelService } from 'app/core/services/model.service';
import { Config } from '../../app.config';
import { TransactionMovement } from '../../components/transaction-type/transaction-type';
import { AuthService } from './auth.service';

import { environment } from 'environments/environment';
import {
  Transaction,
  TransactionStateTiendaNube,
} from '../../components/transaction/transaction';

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
    const URL = `${Config.apiURL}transaction`;

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
    const URL = `${Config.apiURL}transactions`;

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

  public getTransactionsV2(
    project: {},
    match: {},
    sort: {},
    group: {},
    limit: number = 0,
    skip: number = 0
  ): Observable<any> {
    const URL = `${Config.apiURL}v2/transactions`;

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

  public getTransactionsV3(query): Observable<any> {
    const URL = `${Config.apiURL}v3/transactions`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(URL, query, {
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

  public getTotalTransactionsBetweenDates(query?: string): Observable<any> {
    const URL = `${Config.apiURL}total-transactions`;

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

  public getVATBook(query?: string): Observable<any> {
    const URL = `${Config.apiURL}get-vat-book`;

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

  public exportCiti(
    VATPeriod: string,
    transactionMovement: TransactionMovement
  ): Observable<any> {
    const URL = `${Config.apiURL}export-citi`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    let query =
      '{ "VATPeriod": "' +
      VATPeriod +
      '", "transactionMovement": "' +
      transactionMovement +
      '" }';

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

  public downloadFile(fileName: string): Observable<any> {
    const URL = `${Config.apiURL}download-file`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams().set('fileName', fileName);

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

  public validateElectronicTransactionAR(
    transaction: Transaction,
    canceledTransactions: {
      typeId: string;
      code: number;
      origin: number;
      letter: string;
      number: number;
    }
  ): Observable<any> {
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

  public validateElectronicTransactionMX(
    transaction: Transaction,
    movementsOfArticles: MovementOfArticle[],
    movementsOfCashes: MovementOfCash[]
  ): Observable<any> {
    //const URL = `${Config.apiURL_FE_MX}`;
    const URL = `http://vps-1883265-x.dattaweb.com/libs/fe/mx/01_CFDI_fe.php`;

    const headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );

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
      Config.database +
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

  public syncMeli(): Observable<any> {
    const URL = `${environment.apiv2}/meli/import-transactions`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(
        URL,
        {},
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

  public syncWoocommerce(): Observable<any> {
    const URL = `${environment.apiv2}/woo/sync-transactions`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(
        URL,
        {},
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
}
