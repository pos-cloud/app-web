import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Config } from './../app.config';
import { UserService } from './user.service';

@Injectable()
export class ConfigService {

	constructor(
		public _http: Http,
		public _userService: UserService
	) { }

	getConfigLocal() {
		return JSON.parse(localStorage.getItem("config"));
	}

	saveConfigLocal(config: Config) {
		localStorage.removeItem('config');
		localStorage.setItem('config', JSON.stringify(config));
		return true;
	}

	getConfigApi() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.get(Config.apiURL + "config", { headers: headers }).map (res => res.json());
	}

	saveConfigApi(config: Config) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.post(Config.apiURL + "config", config, { headers: headers }).map (res => res.json());
	}

	saveConfigBackup(config: Config) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.post(Config.apiURL + "dirbackup", config, { headers: headers }).map (res => res.json());
	}

	updateConfigApi(config: Config) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.put(Config.apiURL + "config/" + config._id, config, { headers: headers }).map (res => res.json());
	}

	updateConfigBackup(config: Config) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.put(Config.apiURL + "configbackup/" + config._id, config, { headers: headers }).map (res => res.json());
	}

	updateConfigMail(config: Config) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.put(Config.apiURL + "configmail/" + config._id, config, { headers: headers }).map (res => res.json());
	}
}
