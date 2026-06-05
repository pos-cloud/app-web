import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ModelService } from 'app/core/services/model.service';
import { environment } from 'environments/environment';
import { Config } from '../../app.config';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
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

  public downloadBackup(): Observable<any> {
    const URL = `${environment.apiv2}/configs/download-backup`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    // Solicitar el backup al backend
    return this._http
      .get(URL, {
        headers: headers,
        responseType: 'blob', // Indicamos que esperamos un archivo binario (blob)
      })
      .pipe(
        catchError((err) => {
          console.error('Error al solicitar el backup:', err);
          return of(null); // Retornamos null en caso de error
        })
      );
  }

  public getConfigApi(): Observable<any> {
    const URL = `${environment.api}/api/config`;

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

  public getCompanyPicture(picture: string): Observable<any> {
    const URL = `${environment.apiv2}/to-print/get-img`;

    const params = new HttpParams().set('picture', picture);

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

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

  public getCountry() {
    return this._http.get(
      'https://restcountries.com/v2/all?fields=name,alpha2Code,alpha3Code,callingCodes,timezones,flag'
    );
  }

  public getTimeZone(country: string) {
    return this._http.get('https://restcountries.com/v3.1/name/' + country);
  }

  public updateConfig(config: Config): Observable<any> {
    const URL = `${environment.api}/api/config`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams().set('id', config._id);

    return this._http
      .put(URL, config, {
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

}
