import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import * as FileSaver from 'file-saver';
import { BehaviorSubject, of } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { catchError, map } from 'rxjs/operators';
import * as XLSX from 'xlsx';

import { Config } from '../../app.config';
import { DatatableHistory } from '../datatable/datatable-history.interface';
import { AuthService } from '../login/auth.service';
import { ModelService } from '../model/model.service';

import { Company } from './company';
const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable()
export class CompanyService extends ModelService {
  private clients: BehaviorSubject<DatatableHistory> =
    new BehaviorSubject<DatatableHistory>(null);
  private providers: BehaviorSubject<DatatableHistory> =
    new BehaviorSubject<DatatableHistory>(null);
  private provider: BehaviorSubject<DatatableHistory> =
    new BehaviorSubject<DatatableHistory>(null);

  constructor(public _http: HttpClient, public _authService: AuthService) {
    super(
      `companies`, // PATH
      _http,
      _authService
    );
  }

  public setClients(clients: DatatableHistory): void {
    this.clients.next(clients);
  }

  public get getClients() {
    return this.clients.asObservable();
  }

  public setProviders(providers: DatatableHistory): void {
    this.providers.next(providers);
    this.provider.next(providers);
  }

  public get getProviders() {
    return this.provider.asObservable();
  }

  public getCompany(_id: string): Observable<any> {
    const URL = `${Config.apiURL}company`;

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

  public getCompanies(query?: string): Observable<any> {
    const URL = `${Config.apiURL}companies`;

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

  public getCompaniesV2(
    project: {},
    match: {},
    sort: {},
    group: {},
    limit: number = 0,
    skip: number = 0
  ): Observable<any> {
    const URL = `${Config.apiURL}v2/companies`;

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

  public saveCompany(company: Company): Observable<any> {
    const URL = `${Config.apiURL}company`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(URL, company, {
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

  public updateCompany(company: Company): Observable<any> {
    const URL = `${Config.apiURL}company`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams().set('id', company._id);

    return this._http
      .put(URL, company, {
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

  public deleteCompany(_id: string): Observable<any> {
    const URL = `${Config.apiURL}company`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams().set('id', _id);

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

  public getQuantityOfCompaniesByType(
    type: string,
    startDate: string,
    endDate: string
  ): Observable<any> {
    let query =
      '{"type":"' +
      type +
      '","startDate":"' +
      startDate +
      '", "endDate":"' +
      endDate +
      '"}';

    const URL = `${Config.apiURL}quantity-of-companies-by-type`;

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

  public getSalesByCompany(query: string): Observable<any> {
    const URL = `${Config.apiURL}sales-by-company`;

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

  public getSummaryOfAccountsByCompany(
    data: {}
    // page: number,
    // itemsPerPage: number
  ): Observable<any> {
    const URL = `${environment.apiv2}/companies/details-of-accounts-by-company`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(URL, data, {
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

  public getBalanceOfAccountsByCompany(query: {}): Observable<any> {
    const URL = `${environment.apiv2}/companies/total-of-accounts-by-company`;

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

  public getSummaryOfAccounts(query: string): Observable<any> {
    const URL = `${Config.apiURL}summary-of-accounts`;

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

  public getSummaryCurrentAccount(companyId: string): Observable<any> {
    const URL = `${Config.apiV8URL}get-summary-current-account`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(
        URL + `/${companyId}`,
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

  public exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  public exportAsExcelFileMulti(
    json: any[],
    json2: any[],
    excelFileName: string
  ): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const worksheet2: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json2);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet, data2: worksheet2 },
      SheetNames: ['data', 'data2'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });

    FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
  }
}
