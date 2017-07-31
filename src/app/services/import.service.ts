import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Config } from './../app.config';

@Injectable()
export class ImportService {

  constructor(public _http: Http) { }

  import(objectToImport) {
    return this._http.post(Config.apiURL + 'import-xlsx', objectToImport).map (res => res.json());
	}
}
