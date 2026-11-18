import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ModelService } from 'app/core/services/model.service';
import { environment } from 'environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root',
})
export class ApplicationService extends ModelService {
  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {
    super(
      `applications`, // PATH
      _http,
      _authService
    );
  }

  public generateClaudeToken(): Observable<any> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http.post(`${environment.apiv2}/claude-token`, {}, { headers }).pipe(
      map((res) => res),
      catchError((err) => of(err))
    );
  }
}
