import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {of, BehaviorSubject} from 'rxjs';
import {Observable} from 'rxjs/Observable';
import {map, catchError} from 'rxjs/operators';

import {DatatableHistory} from '../datatable/datatable-history.interface';
import {AuthService} from '../login/auth.service';
import { environment } from 'environments/environment';
import { ORIGINMEDIA } from 'app/types';

@Injectable()
export class ModelService {
  public URL = `${environment.apiv2}/`;
  private items: BehaviorSubject<DatatableHistory> =
    new BehaviorSubject<DatatableHistory>(null);

  constructor(
    public path: string,
    public _http: HttpClient,
    public _authService: AuthService,
  ) {
    this.URL += path;
  }

  public setItems(items: DatatableHistory): void {
    this.items.next(items);
  }

  public get getItems() {
    return this.items.asObservable();
  }

  public getById(_id: string): Observable<any> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .get(`${this.URL}/${_id}`, {
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

  public getAll({
    project = {},
    match = {},
    sort = {},
    group = {},
    limit = 0,
    skip = 0,
  }): Observable<any> {
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
      .get(this.URL, {
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

  public save(obj: any): Observable<any> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(this.URL, obj, {
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

  public update(obj: any): Observable<any> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .put(`${this.URL}/${obj._id}`, obj, {
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

  public delete(_id: string): Observable<any> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams().set('id', _id);

    return this._http
      .delete(`${this.URL}/${_id}`, {
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

  public getCities(state: number, name?: string): Observable<any> {
    let URL: string = 'https://apis.datos.gob.ar/georef/api/municipios';

    let params = new HttpParams().set('campos', 'nombre').set('max', '20');

    if (state) {
      params = params.append('provincia', state.toString());
    }
    if (name && name !== '') {
      params = params.append('nombre', name);
    }

    return this._http
      .get(URL, {
        params: params,
      })
      .pipe(
        map((res) => {
          return res['municipios'];
        }),
        catchError((err) => {
          return of(err);
        }),
      );
  }

  public uploadFile(origin: ORIGINMEDIA, file: File): Promise<any> {
    if(origin) {
      
    }
    let xhr: XMLHttpRequest = new XMLHttpRequest();

    xhr.open(
      "POST",
      `${environment.apiStorage}/upload`,
      true
    );
    xhr.setRequestHeader("Authorization", this._authService.getToken());

    return new Promise((resolve, reject) => {
      let formData: any = new FormData();

     
      formData.append("file", file, file.name);

      formData.append('origin', origin)

      xhr.onreadystatechange = function () {
        console.log(xhr);
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

  public progressFunction(evt) {
    if (evt.lengthComputable) {
      let percentage: number = Math.round((evt.loaded / evt.total) * 100);
      // document.getElementsByClassName('labelFile')[0].innerHTML = percentage + "%";
    }
  }

  public deleteFile(filename: string): Observable<any> {
    const URL = `${environment.apiStorage}/upload`;

    const headers = new HttpHeaders()
      .set("Content-Type", "application/json")
      .set("Authorization", this._authService.getToken());

    return this._http
      .delete(URL, {
        headers: headers,
        body: {
          origin: filename
        }
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

  public getFullQuery(query): Observable<any> {
    const URL = `${this.URL}/fullquery`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(URL, query, {
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

  public deleteAll({where = {}}): Observable<any> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams().set('where', JSON.stringify(where));

    return this._http
      .delete(this.URL, {
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
