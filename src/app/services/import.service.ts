import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { empty } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

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
