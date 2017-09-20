import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Config } from './../app.config';
import { UserService } from './user.service';

@Injectable()
export class ImportService {

  constructor(
    public _http: Http,
    public _userService: UserService
  ) { }

  import(objectToImport) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken()
    });
    return this._http.post(Config.apiURL + 'import-xlsx', objectToImport, { headers: headers }).map (res => res.json());
	}
}
