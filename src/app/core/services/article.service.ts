import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AuthService } from './auth.service';

import { ModelService } from 'app/core/services/model.service';

@Injectable({
  providedIn: 'root',
})
export class ArticleService extends ModelService {
  constructor(public _http: HttpClient, public _authService: AuthService) {
    super(
      `articles`, // PATH
      _http,
      _authService
    );
  }

  public getLasCode(): Observable<any> {
    const URL = `${environment.apiv2}/articles/last-code`;

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

  public updatePrices(payload: {
    articlesCode: string[];
    field: string;
    type: number;
    decimal: number;
    amount: number;
  }): Observable<any> {
    const URL = `${environment.apiv2}/articles/update-prices`;
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(URL, payload, { headers })
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((err) => {
          return of(err);
        })
      );
  }

  public makeFileRequest(origin: string, files: Array<File>) {
    let xhr: XMLHttpRequest = new XMLHttpRequest();

    xhr.open('POST', `${environment.apiStorage}/upload`, true);
    xhr.setRequestHeader('Authorization', this._authService.getToken());

    return new Promise((resolve, reject) => {
      let formData: any = new FormData();

      if (files && files.length > 0) {
        for (let i: number = 0; i < files.length; i++) {
          formData.append('file', files[i], files[i].name);
        }
      }

      formData.append('origin', origin);

      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          if (xhr.status == 201) {
            resolve(xhr.response);
          } else {
            reject(xhr.response);
          }
        }
      };

      xhr.send(formData);
    });
  }


  public deleteImageGoogle(origin: string): Observable<any> {
    const URL = `${environment.apiStorage}/upload`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .delete(URL, {
        headers: headers,
        body: {
          origin: origin,
        },
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

  public getAllArticlesTiendaNube(): Observable<any> {
    const URL = `${environment.apiv2}/articles/articles-tiendanube`;

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

  getArticleObjById(id: string): Observable<any> {
    const URL = `${environment.apiv2}/articles/object/${id}`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.get(URL, { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError((err) => {
        return of(err);
      })
    );
  }
}
