import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { of } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Config } from '../../app.config';
import { AuthService } from '../login/auth.service';
import { environment } from "environments/environment";

@Injectable()
export class ImportService {

  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) { }

  public importStock(file: File, depositId: string, branchId: string ): Observable<any> {

    const URL = `${environment.apiv2}/article-stocks/import-excel`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('depositId', depositId);
    formData.append('branchId', branchId);
  
    const headers = new HttpHeaders()
      .set('Authorization', this._authService.getToken());

    return this._http.post(URL, formData, {
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

  public importMovement(objectToImport: {}, transaccionId: string): Observable<any> {

    const URL = `${Config.apiURL}import-movement`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
      .set('transaccion', transaccionId);

    return this._http.post(URL, objectToImport, {
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

  public importArticle(file: File){
    const URL = `${environment.apiv2}/articles/import-excel`;

    const formData = new FormData();
    formData.append('file', file);
  
    const headers = new HttpHeaders()
      .set('Authorization', this._authService.getToken());

    return this._http.post(URL, formData, {
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

  public importCompany(file: File){
    const URL = `${environment.apiv2}/companies/import-excel`;

    const formData = new FormData();
    formData.append('file', file);
  
    const headers = new HttpHeaders()
      .set('Authorization', this._authService.getToken());

    return this._http.post(URL, formData, {
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
