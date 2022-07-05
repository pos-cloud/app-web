import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {of} from 'rxjs';
import {Observable} from 'rxjs/Observable';
import {map, catchError} from 'rxjs/operators';

import {Config} from '../../app.config';
import {AuthService} from '../login/auth.service';

@Injectable()
export class ImportExcelService {
  constructor(public _http: HttpClient, public _authService: AuthService) {}

  public import(
    objectToImport: {},
    type: string,
    idProvider: string = null,
  ): Promise<any> {
    let URL: string;

    if (type === 'clientes') {
      URL = `${Config.apiURL}company/save-excel`;
    } else if (type === 'alta-producto') {
      URL = `${Config.apiV8URL}articles/create-article-excel`;
    } else {
      URL = `${Config.apiV8URL}articles/update-article-excel`;
    }

    let xhr: XMLHttpRequest = new XMLHttpRequest();

    xhr.open('POST', URL, true);
    xhr.setRequestHeader('Authorization', this._authService.getToken());

    if (type === 'clientes') {
      xhr.setRequestHeader('file', objectToImport[0].name);
      xhr.setRequestHeader('excel', objectToImport[0]);
    }

    return new Promise((resolve, reject) => {
      let formData: any = new FormData();

      formData.append('excel', objectToImport[0], objectToImport[0].filename);
      formData.append('idProvider', idProvider);
      xhr.upload.addEventListener('progress', this.progressFunction, false);
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            resolve(JSON.parse(xhr.response));
          } else {
            try {
              reject(JSON.parse(xhr.response));
            } catch (err) {
              reject({message: 'Error al importar el archivo'});
            }
          }
        }
      };
      xhr.send(formData);
    });
  }

  public progressFunction(evt) {
    if (evt.lengthComputable) {
      let percentage: number = Math.round((evt.loaded / evt.total) * 100);
    }
  }

  public importMovement(objectToImport: {}, transaccionId: string): Observable<any> {
    const URL = `${Config.apiURL}import-movement`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams().set('transaccion', transaccionId);

    return this._http
      .post(URL, objectToImport, {
        headers: headers,
      })
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((err) => {
          return of(err);
        }),
      );
  }
  public getCompaniesV2(
    project: {},
    match: {},
    sort: {},
    group: {},
    limit: number = 0,
    skip: number = 0,
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
        }),
      );
  }
}
