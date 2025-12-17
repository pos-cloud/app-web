import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { PrintType } from '@types';
import { environment } from 'environments/environment';
import { Config } from '../../app.config';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PrintService {
  constructor(private _http: HttpClient, private _authService: AuthService) {}

  public toPrint(type: PrintType, body: {}): Observable<Blob> {
    const URL_PRINT = `${environment.apiv2}/to-print/${type}`;
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.post(URL_PRINT, body, { headers, responseType: 'blob' }).pipe(
      map((res) => {
        console.log(res);
        return res;
      }),
      catchError((err: HttpErrorResponse) => {
        if (err.error instanceof Blob) {
          return new Observable<Blob>((observer) => {
            const reader = new FileReader();

            reader.onload = () => {
              try {
                const errorJson = JSON.parse(reader.result as string);
                console.log(errorJson.message);

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

  public toPrintURL(url: string, file: string): Observable<any> {
    const URL = `${Config.apiURL}printURL`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams().set('file', file).set('url', url);

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

  public getBarcode(barcode: string): Observable<any> {
    const URL = `${Config.apiURL}barcode/${barcode}`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .get(URL, {
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

  public saveFile(file, folder, name) {
    return new Promise((resolve, reject) => {
      let data = new FormData();
      data.append('file', file);
      let xhr = new XMLHttpRequest();
      xhr.open('POST', Config.apiURL + 'upload-file/' + folder + '/' + name, true);
      xhr.setRequestHeader('Authorization', this._authService.getToken());
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            resolve(JSON.parse(xhr.response));
          } else {
            reject(xhr.response);
          }
        }
      };
      xhr.send(data);
    });
  }
}
