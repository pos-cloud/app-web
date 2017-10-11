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

	updateConfig(config: Config) {
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
		return this._http.put(Config.apiURL + "config-backup/" + config._id, config, { headers: headers }).map(res => res.json());
	}

	updateConfigEmail(config: Config) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.put(Config.apiURL + "config-email/" + config._id, config, { headers: headers }).map(res => res.json());
	}

	updateConfigCompany(config: Config) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.put(Config.apiURL + "config-company/" + config._id, config, { headers: headers }).map(res => res.json());
	}
}
