import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Config } from './../app.config';

@Injectable()
export class ConfigService {

	public constructor(
		private _http: Http
	) {	}

	getConfigLocal() {
		return JSON.parse(localStorage.getItem("config"));
	}

	saveConfigLocal(config: Config) {
		localStorage.removeItem('config');
		localStorage.setItem('config', JSON.stringify(config));
		return true;
	}

	getConfigApi() {
		return this._http.get(Config.apiURL + "config").map(res => res.json());
	}

	saveConfigApi(config: Config) {
		return this._http.post(Config.apiURL + "config", config).map(res => res.json());
	}

	saveConfigBackup (config: Config) {
		return this._http.post(Config.apiURL + "dirbackup", config).map (res => res.json());
	}

	updateConfigApi(config: Config) {
		return this._http.put(Config.apiURL + "config/" + config._id, config).map(res => res.json());
	}

	updateConfigBackup(config: Config) {
		return this._http.put(Config.apiURL + "configbackup/" + config._id, config).map(res => res.json());
	}

	updateConfigMail(config: Config) {
		return this._http.put(Config.apiURL + "configmail/" + config._id, config).map(res => res.json());
	}
}
