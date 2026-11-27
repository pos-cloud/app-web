import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ModelService } from 'app/core/services/model.service';
import { MovementOfCash } from '../../components/movement-of-cash/movement-of-cash';
import { AuthService } from './auth.service';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MovementOfCashService extends ModelService {
  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {
    super(
      `movements-of-cashes`, // PATH
      _http,
      _authService
    );
  }

  public saveMovementsOfCashes(movementsOfCashes: MovementOfCash[]): Observable<any> {
    const URL = `${environment.apiv2}/movements-of-cashes/bulk`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    return this._http
      .post(
        URL,
        { movementsOfCashes: movementsOfCashes },
        {
          headers: headers,
        }
      )
      .pipe(
        map((res: any) => {
          // Mantener shape legacy usado por apertura/cierre y financiación
          if (res?.result) {
            return {
              ...res,
              movementsOfCashes: res.result,
            };
          }
          return res;
        }),
        catchError((err) => {
          return of(err);
        })
      );
  }
}
