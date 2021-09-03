import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { of } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Transaction } from './transaction';
import { TransactionMovement } from '../transaction-type/transaction-type';
import { Config } from '../../app.config';
import { AuthService } from '../login/auth.service';
import { MovementOfArticle } from 'app/components/movement-of-article/movement-of-article';
import { MovementOfCash } from 'app/components/movement-of-cash/movement-of-cash';
import { ModelService } from '../model/model.service';
import { MovementOfCancellation } from "../movement-of-cancellation/movement-of-cancellation";

@Injectable()
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

    const params = new HttpParams()
      .set('id', _id);

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

  public getTransactions(
    query?: string
  ): Observable<any> {

    const URL = `${Config.apiURL}transactions`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
      .set('query', query);

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

  public getTransactionsV3(
    query
  ): Observable<any> {

    const URL = `${Config.apiURL}v3/transactions`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.post(URL, query, {
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

  public getTotalTransactionsBetweenDates(
    query?: string
  ): Observable<any> {

    const URL = `${Config.apiURL}total-transactions`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
      .set('query', query);

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

  public getVATBook(
    query?: string
  ): Observable<any> {

    const URL = `${Config.apiURL}get-vat-book`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
      .set('query', query);

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

  public exportCiti(
    VATPeriod: string,
    transactionMovement: TransactionMovement
  ): Observable<any> {

    const URL = `${Config.apiURL}export-citi`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    let query = '{ "VATPeriod": "' + VATPeriod + '", "transactionMovement": "' + transactionMovement + '" }';

    const params = new HttpParams()
      .set('query', query);

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

  public downloadFile(
    fileName: string
  ): Observable<any> {

    const URL = `${Config.apiURL}download-file`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
      .set('fileName', fileName);

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

  public saveTransaction(transaction: Transaction): Observable<any> {

    const URL = `${Config.apiURL}transaction`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.post(URL, transaction, {
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

  public validateElectronicTransactionAR(
    transaction: Transaction,
    movementsOfCancellations: MovementOfCancellation[]): Observable<any> {

    //const URL = `${Config.apiURL_FE_AR}`;
    const URL = `http://vps-1883265-x.dattaweb.com/libs/fe/ar/index.php`;
    //const URL = `http://localhost/libs/fe-ar/index.php`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded');


    let canceledTransactions: {
      Tipo: number,
      PtoVta: number,
      Nro: number
    };

    if (movementsOfCancellations && movementsOfCancellations.length) {
      for (let movementOfCancellation of movementsOfCancellations) {
        let code: number;
        for (let cod of movementOfCancellation.transactionOrigin.type.codes) {
          if (cod.letter === movementOfCancellation.transactionOrigin.letter) {
            code = cod.code;
          }
        }
        canceledTransactions = {
          Tipo: code,
          PtoVta: movementOfCancellation.transactionOrigin.origin,
          Nro: movementOfCancellation.transactionOrigin.number
        };
      }
    }

    let body = 'transaction=' + JSON.stringify(transaction) + '&' +
      'canceledTransactions=' + JSON.stringify(canceledTransactions) + '&' +
      'config=' + '{"companyIdentificationValue":"' + Config.companyIdentificationValue + '","vatCondition":' + Config.companyVatCondition.code + ',"database":"' + Config.database + '"}';

    return this._http.post(URL, body, {
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

  public validateElectronicTransactionMX(
    transaction: Transaction,
    movementsOfArticles: MovementOfArticle[],
    movementsOfCashes: MovementOfCash[]
  ): Observable<any> {

    //const URL = `${Config.apiURL_FE_MX}`;
    const URL = `http://vps-1883265-x.dattaweb.com/libs/fe/mx/01_CFDI_fe.php`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded');

    let body = 'transaction=' + JSON.stringify(transaction) + '&' +
      'movementsOfArticles=' + JSON.stringify(movementsOfArticles) + '&' +
      'movementsOfCashes=' + JSON.stringify(movementsOfCashes) + '&' +
      'config=' + '{"companyIdentificationValue":"' + Config.companyIdentificationValue + '","vatCondition":' + Config.companyVatCondition.code + ',"companyName":"' + Config.companyName + '","companyPostalCode":"' + Config.companyPostalCode + '","database":"' + Config.database + '"}';

    return this._http.post(URL, body, {
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

  public updateTransaction(transaction: Transaction): Observable<any> {

    const URL = `${Config.apiURL}transaction`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
      .set('id', transaction._id);

    return this._http.put(URL, transaction, {
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

  public updateBalance(transaction: Transaction): Observable<any> {

    const URL = `${Config.apiURL}update-balance`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.put(URL, transaction, {
      headers: headers,
    }).pipe(
      map(res => {
        return res;
      }),
      catchError((err) => {
        return of(err);
      })
    );
  }

  public deleteTransaction(_id: string): Observable<any> {

    const URL = `${Config.apiURL}transaction`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
      .set('id', _id);

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

  public syncMeli(): Observable<any> {

    const URL = `${Config.apiV8URL}meli/import-transactions`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.post(URL, {}, {
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

  public syncWoocommerce(): Observable<any> {

    const URL = `${Config.apiV8URL}woo/sync-transactions`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.post(URL, {}, {
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
}
