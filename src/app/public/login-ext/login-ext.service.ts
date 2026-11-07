import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface ExternalSession {
  token: string;
  name: string;
  email: string;
  database: string;
}

export interface MemberInstallment {
  period: string;
  type: string;
  number?: number;
  totalPrice: number;
  status: string;
  due: number;
}

export interface MemberAccount {
  member: { name: string; email: string };
  company: {
    name: string;
    fantasyName: string;
    identificationValue: string;
    plan: string;
    active: boolean;
  } | null;
  installments: MemberInstallment[];
  totalDue: number;
}

export interface AccessQr {
  code: string;
  qr: string;
}

@Injectable({
  providedIn: 'root',
})
export class LoginExtService {
  constructor(private http: HttpClient) {}

  login(database: string, user: string, password: string): Observable<{ session?: ExternalSession; message?: string }> {
    const trimmed = user.trim();
    const body: { password: string; platform: 'web'; name?: string; email?: string } = {
      password,
      platform: 'web',
    };
    if (trimmed.includes('@')) {
      body.email = trimmed;
    } else {
      body.name = trimmed;
    }

    return this.http.post(`${environment.apiv2}/auth/login-ext?database=${encodeURIComponent(database)}`, body).pipe(
      map((res: { result?: { token?: string; user?: { name?: string; email?: string } }; message?: string }) => {
        const token = res?.result?.token;
        const member = res?.result?.user;
        if (!token || !member) {
          return { message: res?.message || 'No se pudo iniciar sesión.' };
        }
        const session: ExternalSession = {
          token,
          name: member.name || trimmed,
          email: member.email || '',
          database,
        };
        this.saveSession(session);
        return { session };
      }),
      catchError((err) => of({ message: this.errorMessage(err) }))
    );
  }

  account(session: ExternalSession): Observable<{ account?: MemberAccount; message?: string }> {
    return this.http.get(`${environment.apiv2}/auth/login-ext/account`, { headers: this.headers(session) }).pipe(
      map((res: { result?: MemberAccount }) => ({ account: res?.result })),
      catchError((err) => of({ message: this.errorMessage(err) }))
    );
  }

  requestAccess(session: ExternalSession): Observable<{ access?: AccessQr; message?: string }> {
    return this.http.post(`${environment.apiv2}/auth/login-ext/access`, {}, { headers: this.headers(session) }).pipe(
      map((res: { result?: AccessQr }) => ({ access: res?.result })),
      catchError((err) => of({ message: this.errorMessage(err) }))
    );
  }

  readSession(database: string): ExternalSession | null {
    const raw = sessionStorage.getItem(this.storageKey(database));
    if (!raw) return null;
    try {
      const session = JSON.parse(raw) as ExternalSession;
      if (!session?.token || session.database !== database) return null;
      return session;
    } catch {
      return null;
    }
  }

  clearSession(database: string): void {
    sessionStorage.removeItem(this.storageKey(database));
  }

  private saveSession(session: ExternalSession): void {
    sessionStorage.setItem(this.storageKey(session.database), JSON.stringify(session));
  }

  private storageKey(database: string): string {
    return `login-ext:${database}`;
  }

  private headers(session: ExternalSession): HttpHeaders {
    return new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', session.token);
  }

  private errorMessage(err: { error?: { message?: string }; message?: string; status?: number }): string {
    if (err?.status === 0) return 'Error de conexión con el servidor.';
    return err?.error?.message || err?.message || 'No se pudo completar la operación.';
  }
}
