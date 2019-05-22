import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class MailService {

	constructor(
		public _http: Http,
		public _authService: AuthService
	) { }

  sendMail (objectToImport) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.post(Config.apiURL + '/send-email', objectToImport, { headers: headers }).map (res => res.json());
	}
}