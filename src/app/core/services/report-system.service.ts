import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { AuthService } from 'app/core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ReportSystemService {
  constructor(public _http: HttpClient, public _authService: AuthService) {}

  public getReport(data: {}): Observable<any> {
    const URL = `${environment.apiv2}/reports-system/${data['reportType']}`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(URL, data, {
        headers: headers,
        responseType: 'blob',
      })
      .pipe(
        switchMap((res: Blob) => {
          // Verificamos si el blob es un JSON
          if (res.type === 'application/json') {
            return new Observable((observer) => {
              const reader = new FileReader();
              reader.onload = () => {
                const json = JSON.parse(reader.result as string);
                observer.next(json);
                observer.complete();
              };
              reader.onerror = (err) => {
                observer.error(err);
              };
              reader.readAsText(res);
            });
          } else {
            // Es un archivo real, devolvemos el blob directamente
            return of(res);
          }
        }),
        catchError((err) => {
          return of(err);
        })
      );
  }

  public getChart(data: {}): Observable<any> {
    const URL = `${environment.apiv2}/chart/${data['type']}`;

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
}
