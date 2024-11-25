import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { catchError, map } from 'rxjs/operators';

import { AuthService } from 'app/core/services/auth.service';
import { ModelService } from 'app/core/services/model.service';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ResourceService extends ModelService {
  public routeParams: any;

  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {
    super(
      `resources`, // PATH
      _http,
      _authService
    );
  }

  public makeFileRequest(origin: string, file: File) {
    let xhr: XMLHttpRequest = new XMLHttpRequest();

    xhr.open('POST', `${environment.apiStorage}/upload`, true);
    xhr.setRequestHeader('Authorization', this._authService.getToken());

    return new Promise((resolve, reject) => {
      let formData: any = new FormData();

      formData.append('file', file, file.name);

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
}
