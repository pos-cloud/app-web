import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { faro } from '@grafana/faro-web-sdk';
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
      this.setFaroCompany(localStorage.getItem('company'));
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

  loginStorage(user: User, company?: string): void {
    this.clearDatatableSessionPreferences();
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('session_token', user.token);
    this.identity.next(user);

    const negocio = (company ?? localStorage.getItem('company') ?? '').trim();
    if (negocio) {
      localStorage.setItem('company', negocio);
      this.setFaroCompany(negocio);
    }
  }

  private clearDatatableSessionPreferences(): void {
    const suffixes = ['_itemsPerPage', '_datatableFilters', '_currentPage'];

    Object.keys(localStorage).forEach((key) => {
      if (suffixes.some((suffix) => key.endsWith(suffix))) {
        localStorage.removeItem(key);
      }
    });
  }

  private setFaroCompany(company: string | null): void {
    if (!environment.faro?.url || !faro?.api) {
      return;
    }

    const negocio = (company ?? '').trim();
    if (negocio) {
      // Identidad = base/negocio (no el usuario admin, que se repite entre clientes)
      faro.api.setUser({
        id: negocio,
        username: negocio,
      });
    } else {
      faro.api.resetUser();
    }
  }

  logoutStorage(): void {
    sessionStorage.removeItem('session_token');
    sessionStorage.removeItem('user');
    this.identity.next(null);
    this.setFaroCompany(null);
    this._router.navigate(['/login']);
  }

  lockedStorage(): void {
    sessionStorage.removeItem('session_token');
    sessionStorage.removeItem('user');
    this.identity.next(null);
    this.setFaroCompany(null);
    this._router.navigate(['/login'], {
      queryParams: {
        return: this._router.url,
      },
    });
  }

  getToken(): string {
    return sessionStorage.getItem('session_token') || '';
  }
}
