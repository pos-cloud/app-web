import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { of } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";
import { AuthService } from '../login/auth.service';
import { Config } from 'app/app.config';

@Injectable()
export class ModelService {

  private URL = `${Config.apiURL}/`;

  constructor(
    public path: string,
    public _http: HttpClient,
    public _authService: AuthService,
  ) {
    this.URL += path;
  }

  public getById(_id: string): Observable<any> {

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.get(`${this.URL}/${_id}`, {
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

  public getAll(
    project: {},
    match: {},
    sort: {},
    group: {},
    limit: number = 0,
    skip: number = 0
  ): Observable<any> {

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

    return this._http.get(this.URL, {
      headers: headers,
      params: params
    }).pipe(
      map(res => {
        return res;
      }),
      catchError((err) => {
        return of(err);
      })
    );
  }

  public save(obj: any): Observable<any> {

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.post(this.URL, obj, {
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

  public update(obj: any): Observable<any> {

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.put(`${this.URL}/${obj._id}`, obj, {
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

  public delete(_id: string): Observable<any> {

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
      .set('id', _id);

    return this._http.delete(`${this.URL}/${_id}`, {
      headers: headers,
      params: params
    }).pipe(
      map(res => {
        return res;
      }),
      catchError((err) => {
        return of(err);
      })
    );
  }

  public getStates(name?: string): Observable<any> {

    let URL: string = 'https://apis.datos.gob.ar/georef/api/provincias';

    let params = new HttpParams()
      .set('campos', 'nombre')
      .set('max', '20');
    if (name && name !== '') {
      params = params.append('nombre', name);
    }
    return this._http.get(URL, {
      params: params
    }).pipe(
      map(res => {
        return res['provincias'];
      }),
      catchError((err) => {
        return of(err);
      })
    );
  }

  public getCities(state: number, name?: string): Observable<any> {

    let URL: string = 'https://apis.datos.gob.ar/georef/api/municipios';

    let params = new HttpParams()
      .set('campos', 'nombre')
      .set('max', '20');
    if (state) {
      params = params.append('provincia', state.toString());
    }
    if (name && name !== '') {
      params = params.append('nombre', name);
    }
    return this._http.get(URL, {
      params: params
    }).pipe(
      map(res => {
        return res['provincias'];
      }),
      catchError((err) => {
        return of(err);
      })
    );
  }

  public makeFileRequest(type: String, idResource: String, file: File) {

    let xhr: XMLHttpRequest = new XMLHttpRequest();
    xhr.open('POST', Config.apiURL + '/resources/upload?type='+type+'&id='+idResource, true);
    xhr.setRequestHeader('Authorization', this._authService.getToken());

    return new Promise((resolve, reject) => {
      let formData: any = new FormData();

      formData.append('image', file, file.name);

      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            resolve(JSON.parse(xhr.response));
          } else {
            reject(JSON.parse(xhr.response));
          }
        }
      }

      xhr.send(formData);
    });
  }
}
