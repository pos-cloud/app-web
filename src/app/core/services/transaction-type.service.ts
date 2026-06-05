import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ModelService } from 'app/core/services/model.service';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionTypeService extends ModelService {
  public _jsonURL = 'assets/datos/optionalAFIP.json';

  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {
    super(
      `transaction-types`, // PATH
      _http,
      _authService
    );
  }

  public getJSON(): Observable<any> {
    return this._http.get(this._jsonURL);
  }
}
