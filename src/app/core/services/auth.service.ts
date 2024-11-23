import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Config } from 'app/app.config';
import { User } from 'app/components/user/user';
import { BehaviorSubject, of } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private identity: BehaviorSubject<User | null> =
    new BehaviorSubject<User | null>(null);

  constructor(
    private _router: Router,
    private _http: HttpClient
  ) {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      this.identity.next(JSON.parse(storedUser));
    }
  }

  get getIdentity(): Observable<User | null> {
    return this.identity.asObservable();
  }

  login(database: string, user: string, password: string): Observable<any> {
    const URL = `${Config.apiURL}login`;
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this._http.post(URL, { database, user, password }, { headers }).pipe(
      map((res) => res),
      catchError((err) => of(err))
    );
  }

  register(data): Observable<any> {
    const URL = `${Config.apiURL}register`;

    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this._http
      .post(URL, data, {
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

  loginStorage(user: User): void {
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('session_token', user.token);
    this.identity.next(user);
  }

  logoutStorage(): void {
    sessionStorage.removeItem('session_token');
    sessionStorage.removeItem('user');
    this.identity.next(null);
    this._router.navigate(['/login']);
  }

  lockedStorage(): void {
    sessionStorage.removeItem('session_token');
    sessionStorage.removeItem('user');
    this.identity.next(null);
    let hostname = window.location.hostname;
    let subdominio = '';

    if (hostname.includes('.poscloud.com.ar')) {
      subdominio = hostname
        .split('.poscloud.com.ar')[0]
        .replace(/\//g, '')
        .replace(/:/g, '')
        .replace(/http/g, '')
        .replace(/www./g, '')
        .replace(/https/g, '');
    }
    Config.setDatabase(subdominio);
    this._router.navigate(['/login'], {
      queryParams: {
        return: this._router.url,
      },
    });
  }

  isValidToken(token: string): Observable<any> {
    const URL = `${Config.apiURL}validate_token`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this.getToken());

    const params = new HttpParams().set('token', token.replace(/"/gi, ''));

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

  checkPermission(employee: string): Observable<any> {
    const URL = `${Config.apiURL}check_permission`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this.getToken());

    const params = new HttpParams().set('employee', employee);

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

  getToken(): string {
    return sessionStorage.getItem('session_token') || '';
  }
}
