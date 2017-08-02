import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Config } from './../app.config';

@Injectable()
export class ConfigService {

	constructor(public _http: Http) { }

	getConfig() {
		return this._http.get(Config.apiURL + "config").map(res => res.json());
	}

	saveConfig(config: Config) {
		return this._http.post(Config.apiURL + "config", config).map(res => res.json());
	}

	updateConfig(config: Config) {
		return this._http.put(Config.apiURL + "config/" + config._id, config).map(res => res.json());
	}
}
