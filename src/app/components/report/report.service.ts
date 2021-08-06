import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { ModelService } from '../model/model.service';
import { AuthService } from '../login/auth.service';
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";

@Injectable()
export class ReportService extends ModelService {

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

  public getReportResult(name: string, params: any): Observable<any> {

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.get(`${this.URL}-view/${name}`, {
      headers: headers,
      params : params
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
