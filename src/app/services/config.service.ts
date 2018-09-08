import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Config } from './../app.config';
import { UserService } from './user.service';

@Injectable()
export class ConfigService {

	constructor(
		public _http: Http,
		public _userService: UserService
	) { }

	getConfigApi() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "config", { headers: headers }).map (res => res.json());
	}

	getlicense() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "/download-license", { headers: headers }).map (res => res.json());
	}

	saveConfigApi(config: Config) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.post(Config.apiURL + "config", config, { headers: headers }).map (res => res.json());
	}

	updateConfig(config: Config) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.put(Config.apiURL + "config/" + config._id, config, { headers: headers }).map (res => res.json());
	}

	updateConfigBackup(config: Config) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.put(Config.apiURL + "config-backup/" + config._id, config, { headers: headers }).map(res => res.json());
	}

	updateConfigEmail(config: Config) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.put(Config.apiURL + "config-email/" + config._id, config, { headers: headers }).map(res => res.json());
	}

	updateConfigCompany(config: Config) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.put(Config.apiURL + "config-company/" + config._id, config, { headers: headers }).map(res => res.json());
	}

	updateConfigLabel(config: Config) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.put(Config.apiURL + "config-label/" + config._id, config, { headers: headers }).map(res => res.json());
	}

	generateCRS (config: Config){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.post(Config.apiURL + "generate-crs", config, {headers: headers}).map(res => res.json());
	}
}
