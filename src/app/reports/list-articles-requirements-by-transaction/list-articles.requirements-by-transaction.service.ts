import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { of } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { catchError, map } from 'rxjs/operators';

import { AuthService } from '../../components/login/auth.service';
import { ModelService } from '../../components/model/model.service';

@Injectable()
export class ListArticlesRequirementsByTransactionService extends ModelService {
  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {
    super(
      `reports`, // PATH
      _http,
      _authService
    );
  }

  public getRequirementByTransaction(
    startDate: string,
    endDate: string,
    status: string[],
    transactionType: string[],
    dateSelect: string,
    branch: string
  ): Observable<any> {
    const URL = `${environment.apiv2}reports/article-requirements`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(
        URL,
        {
          startDate: startDate,
          endDate: endDate,
          status: status,
          transactionType: transactionType,
          dateSelect: dateSelect,
          branch: branch,
        },
        { headers: headers }
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