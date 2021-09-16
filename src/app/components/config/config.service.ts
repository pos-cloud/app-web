import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, of } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Config } from '../../app.config';
import { AuthService } from '../login/auth.service';
import { ModelService } from '../model/model.service';

@Injectable()
export class ConfigService extends ModelService {

  private config: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {
    super(
      `configs`, // PATH
      _http,
      _authService
    );
  }

  public setConfig(config: any) {
    this.config.next(config);
  }

  get getConfig() {
    return this.config.asObservable();
  }
  public generateBackUp(): Observable<any> {
    const URL = `${Config.apiV8URL}configs/generateBackUp`;
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());
    return this._http.get(URL, {
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
  public getConfigApi(): Observable<any> {

    const URL = `${Config.apiURL}config`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.get(URL, {
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

  public getCompanyPicture(picture: string): Observable<any> {

    const URL = `${Config.apiURL}get-image-base64-company`;

    const params = new HttpParams()
      .set('picture', picture);

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.get(URL, {
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

  public generateLicensePayment(): Observable<any> {

    const URL = `${Config.apiURL}generar-licencia-payment`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.get(URL, {
      headers: headers,
    }).pipe(
      map(res => {
        return res;
      }),
      catchError((err) => {
        return of(err);
      })
    );
  }

  public getCountry() {
    return this._http.get("https://restcountries.eu/rest/v2/all?fields=name;alpha2Code;timezones;alpha3Code;flag;callingCodes")
  }

  public getTimeZone(country: string) {
    return this._http.get("https://restcountries.eu/rest/v2/alpha/" + country)
  }

  public saveConfig(config: Config): Observable<any> {

    const URL = `${Config.apiURL}config`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.post(URL, config, {
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

  public generateCRS(config: Config): Observable<any> {

    const URL = `${Config.apiURL}generate-crs`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.post(URL, config, {
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

  public updateConfig(config: Config): Observable<any> {

    const URL = `${Config.apiURL}config`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
      .set('id', config._id);

    return this._http.put(URL, config, {
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

  public makeFileRequest(config, files: Array<File>) {

    let xhr: XMLHttpRequest = new XMLHttpRequest();
    xhr.open('POST', Config.apiURL + 'upload-image-company/' + config._id, true);
    xhr.setRequestHeader('Authorization', this._authService.getToken());

    return new Promise((resolve, reject) => {
      let formData: any = new FormData();

      if (files && files.length > 0) {
        for (let i: number = 0; i < files.length; i++) {
          formData.append('image', files[i], files[i].name);
        }
      }

      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            resolve(JSON.parse(xhr.response));
          } else {
            reject(xhr.response);
          }
        }
      }

      xhr.send(formData);
    });
  }

  public updloadFile(files: Array<File>) {

    let xhr: XMLHttpRequest = new XMLHttpRequest();
    xhr.open('POST', Config.apiURL + 'upload-crt', true);
    xhr.setRequestHeader('Authorization', this._authService.getToken());

    return new Promise((resolve, reject) => {
      let formData: any = new FormData();

      if (files && files.length > 0) {
        for (let i: number = 0; i < files.length; i++) {
          formData.append('file', files[i], files[i].name);
        }
      }

      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            resolve(JSON.parse(xhr.response));
          } else {
            reject(xhr.response);
          }
        }
      }

      xhr.send(formData);
    });
  }

  public deletePicture(_id: string): Observable<any> {

    const URL = `${Config.apiURL}delete-image-company`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
      .set('id', _id);

    return this._http.delete(URL, {
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

  public getModel(model: string): Observable<any> {

    const URL = `${Config.apiURL}model`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
      .set('model', model);

    return this._http.get(URL, {
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
}
