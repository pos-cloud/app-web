import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse, Notification } from '@types';
import { AuthService } from 'app/core/services/auth.service';
import { ModelService } from 'app/core/services/model.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService extends ModelService {
  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {
    super('notifications', _http, _authService);
  }

  public getMine(limit = 20): Observable<Notification[] | null> {
    const headers = this.getHeaders();

    return this._http.get<ApiResponse>(`${this.URL}/mine`, { headers, params: { limit } }).pipe(
      map((response) => (response.status === 200 ? response.result : null)),
      catchError(() => of(null))
    );
  }

  public getUnreadCount(): Observable<number> {
    const headers = this.getHeaders();

    return this._http.get<ApiResponse>(`${this.URL}/unread-count`, { headers }).pipe(
      map((response) => (response.status === 200 ? (response.result?.count ?? 0) : 0)),
      catchError(() => of(0))
    );
  }

  public markAsRead(id: string): Observable<ApiResponse | null> {
    const headers = this.getHeaders();

    return this._http.put<ApiResponse>(`${this.URL}/${id}/read`, {}, { headers }).pipe(
      map((response) => response),
      catchError(() => of(null))
    );
  }

  public markAllAsRead(): Observable<ApiResponse | null> {
    const headers = this.getHeaders();

    return this._http.put<ApiResponse>(`${this.URL}/read-all`, {}, { headers }).pipe(
      map((response) => response),
      catchError(() => of(null))
    );
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', this._authService.getToken());
  }
}
