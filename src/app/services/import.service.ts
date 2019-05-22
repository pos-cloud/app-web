import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class ImportService {

  constructor(
    public _http: Http,
    public _authService: AuthService
  ) { }

  import(objectToImport) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.post(Config.apiURL + 'import-xlsx', objectToImport, { headers: headers }).map (res => res.json());
  }
  
  importMovement(objectToImport,transaccion) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.post(Config.apiURL + 'import-movement/'+ transaccion, objectToImport, { headers: headers }).map (res => res.json());
	}
}
