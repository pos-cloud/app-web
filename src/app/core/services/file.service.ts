import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from 'app/core/services/auth.service';
import { environment } from 'environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {}

  public uploadImage(origin: string, files: Array<File>) {
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

  public deleteImage(origin: string): Observable<any> {
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
