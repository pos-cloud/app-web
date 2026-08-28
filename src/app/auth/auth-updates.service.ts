import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export type AuthUpdateTag = 'Nuevo' | 'Mejora' | 'Corrección';

export interface AuthUpdate {
  date: string;
  tag: AuthUpdateTag;
  title: string;
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthUpdatesService {
  constructor(private http: HttpClient) {}

  getLatest(): Observable<AuthUpdate[]> {
    return this.http.get<{ updates?: AuthUpdate[] }>(`${environment.apiv2}/updates/latest`).pipe(
      map((result) => result?.updates ?? []),
      catchError(() => of([]))
    );
  }
}
