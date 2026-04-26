import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Config } from 'app/app.config';
import { User } from '@types';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private identity: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);

  constructor(private _router: Router, private _http: HttpClient) {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      this.identity.next(JSON.parse(storedUser));
    }
  }

  get getIdentity(): Observable<User | null> {
    return this.identity.asObservable();
  }

  login(database: string, user: string, password: string): Observable<any> {
    const URL = `${environment.apiv2}/auth/login?database=${encodeURIComponent(database)}`;
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    const body: { password: string; platform: 'web'; name?: string; email?: string } = {
      password,
      platform: 'web',
    };
    const trimmed = user.trim();
    if (trimmed.includes('@')) {
      body.email = trimmed;
    } else {
      body.name = trimmed;
    }

    return this._http.post(URL, body, { headers }).pipe(
      map((res: any) => {
        const payload = res?.result ?? res;
        if (!payload?.user) {
          return {
            message: res?.message ?? payload?.message ?? '',
          };
        }
        const tokenPayload = payload.token;
        const token =
          typeof tokenPayload === 'string' ? tokenPayload : tokenPayload?.token;
        if (!token) {
          return { message: 'Respuesta de login inválida.' };
        }
        return {
          user: { ...payload.user, token },
        };
      }),
      catchError((err) => {
        if (err?.status === 0) {
          return of({
            message: 'Error de conexión con el servidor. Comunicarse con Soporte.',
          });
        }
        const msg =
          err?.error?.message ??
          err?.message ??
          'No se pudo iniciar sesión. Verifique usuario y contraseña.';
        return of({ message: msg });
      })
    );
  }

  register(data): Observable<any> {
    const URL = `${environment.apiv2}/auth/register`;

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
    const URL = `${environment.api}/api/validate_token`;

    const headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', this.getToken());

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
    const URL = `${environment.api}/api/check_permission`;

    const headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', this.getToken());

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
