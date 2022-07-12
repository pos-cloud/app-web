import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { of } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Config } from '../../app.config';
import { AuthService } from '../login/auth.service';
import { environment } from "environments/environment";

@Injectable()
export class EmailService {

  constructor(
    private _http: HttpClient,
    private _authService: AuthService
  ) { }

  public sendEmail(data: {}): Observable<any> {

    const URL = `${Config.apiURL}send-email-client`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.post(URL, data, {
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

  public sendEmailToClient(
    subject: string,
    message: string
  ): Observable<any> {

    const URL = `${Config.apiURL}send-email-to-client`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.post(URL,
      {
        subject: subject,
        message: message
      }, {
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

  public sendEmailClient(
    subject: string,
    body: string,
    emails: string
  ): Observable<any> {

    const URL = `${Config.apiURL}send-email-client`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.post(URL,
      {
        subject: subject,
        body: body,
        emails: emails
      }, {
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

  public sendEmailV2(data: {}): Observable<any> {

    const URL = `${environment.apiv2}/email-templates/send-email`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.post(URL, data, {
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
