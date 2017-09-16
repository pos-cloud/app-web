import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Config } from './../app.config';

@Injectable()
export class MailService {

  constructor(public _http: Http) { }

  sendMail (objectToImport) {
		return this._http.post(Config.apiURL + '/send-email',objectToImport).map (res => res.json());
	}
}