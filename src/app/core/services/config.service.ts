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

  constructor(public _http: HttpClient, public _authService: AuthService) {
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
    const URL = `${Config.apiURL}config`;

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

  public generateLicensePayment(): Observable<any> {
    const URL = `${Config.apiURL}generar-licencia-payment`;

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

  public getCountry() {
    return this._http.get(
      'https://restcountries.com/v2/all?fields=name,alpha2Code,alpha3Code,callingCodes,timezones,flag'
    );
  }

  public getTimeZone(country: string) {
    return this._http.get('https://restcountries.com/v3.1/name/' + country);
  }

  public saveConfig(config: Config): Observable<any> {
    const URL = `${Config.apiURL}config`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(URL, config, {
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

  public generateCRS(companyName: string, companyCUIT: string): Observable<any> {
    const URL = `${environment.feAr}/cert`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(
        URL,
        {
          companyName: companyName,
          companyCUIT: companyCUIT,
        },
        {
          headers: headers,
          responseType: 'blob',
        }
      )
      .pipe(
        map((res) => {
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
      };

      xhr.send(formData);
    });
  }

  public uploadCRT(files: Array<File>, companyCUIT: string): Promise<any> {
    let xhr: XMLHttpRequest = new XMLHttpRequest();
    xhr.open('POST', `${environment.feAr}/cert/upload-crt/${companyCUIT}`, true);
    xhr.setRequestHeader('Authorization', this._authService.getToken());

    const formData: FormData = new FormData();

    // Agregar el archivo(s) al FormData
    if (files && files.length > 0) {
      for (let i: number = 0; i < files.length; i++) {
        formData.append('file', files[i], files[i].name);
      }
    }

    return new Promise((resolve, reject) => {
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 201) {
            resolve(JSON.parse(xhr.response));
          } else {
            reject(xhr.response);
          }
        }
      };

      xhr.send(formData);
    });
  }

  public deletePicture(_id: string): Observable<any> {
    const URL = `${Config.apiURL}delete-image-company`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams().set('id', _id);

    return this._http
      .delete(URL, {
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

  public getModel(model: string): Observable<any> {
    const URL = `${Config.apiURL}model`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams().set('model', model);

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
}
