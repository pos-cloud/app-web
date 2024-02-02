import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { of } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { AuthService } from "../login/auth.service";
import { environment } from "environments/environment";

@Injectable()
export class MenuService {
  constructor(
    public _http: HttpClient,
    public _authService: AuthService,
  ) {}

  public getMenu(database: string): Observable<any> {
    const URL = `${environment.apiv2}/menu/${database}`;

    return this._http.get(URL, {}).pipe(
      map((res) => {
        return res;
      }),
      catchError((err) => {
        return of(err);
      }),
    );
  }
}
