import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of } from 'rxjs';

import { User } from '@types';
import { ModelService } from 'app/core/services/model.service';
import { environment } from 'environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService extends ModelService {
  private userPos: BehaviorSubject<User> = new BehaviorSubject<User>(null);

  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {
    super(
      `users`, // PATH
      _http,
      _authService
    );
  }

  public getUserObjById(id: string): Observable<any> {
    const URL = `${environment.apiv2}/users/object/${id}`;

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
