import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ArcaService {
  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {}

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
}
