import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { PrintType } from '@types';
import { environment } from 'environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PrintService {
  constructor(
    private _http: HttpClient,
    private _authService: AuthService
  ) {}

  public toPrint(type: PrintType | string, body: {}): Observable<Blob> {
    const URL_PRINT = `${environment.apiv2}/to-print/${type}`;
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.post(URL_PRINT, body, { headers, responseType: 'blob' }).pipe(
      map((res) => {
        return res;
      }),
      catchError((err: HttpErrorResponse) => {
        if (err.error instanceof Blob) {
          return new Observable<Blob>((observer) => {
            const reader = new FileReader();

            reader.onload = () => {
              try {
                const errorJson = JSON.parse(reader.result as string);

                observer.error(errorJson);
              } catch (e) {
                observer.error(err);
              }
            };

            reader.readAsText(err.error);
          });
        }

        return throwError(() => err);
      })
    );
  }
}
