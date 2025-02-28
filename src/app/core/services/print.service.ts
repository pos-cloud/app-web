import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from 'environments/environment';
import * as printJS from 'print-js';
import { Config } from '../../app.config';
import { AuthService } from './auth.service';

export enum PrintType {
  Article = 'article',
  PriceList = 'price-list',
  Labels = 'labels',
  Transaction = 'transaction',
  Bar = 'Bar',
  Kitchen = 'kitchen',
}

@Injectable({
  providedIn: 'root',
})
export class PrintService {
  constructor(private _http: HttpClient, private _authService: AuthService) {}

  public toPrint(type: PrintType, body: {}) {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    this._http.post(`${environment.apiv2}/to-print/${type}`, body, { headers, responseType: 'blob' }).subscribe(
      (res: Blob) => {
        if (res) {
          const blobUrl = URL.createObjectURL(res);
          printJS(blobUrl);
        } else {
          console.error('Error al generar el PDF');
        }
      },
      (error) => {
        console.error('Error en la impresión:', error);
      }
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
