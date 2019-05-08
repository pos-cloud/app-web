import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
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

  public makeFileRequest(config, files: Array<File>) {

    let xhr: XMLHttpRequest = new XMLHttpRequest();
    xhr.open('POST', Config.apiURL + 'upload-image-company/' + config._id, true);
    xhr.setRequestHeader('Authorization', this._userService.getToken());
    xhr.setRequestHeader('Database', this._userService.getDatabase());

    return new Promise((resolve, reject) => {
      let formData: any = new FormData();

      if (files && files.length > 0) {
        for (let i: number = 0; i < files.length; i++) {
          formData.append('image', files[i], files[i].name);
        }
      }

      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            resolve(JSON.parse(xhr.response));
          } else {
            reject(xhr.response);
          }
        }
      }

      xhr.send(formData);
    });
  }

  getCompanyPicture(picture: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken(),
      'Database': this._userService.getDatabase()
    });
    return this._http.get(Config.apiURL + 'get-image-base64-company/' + picture, { headers: headers }).map(res => res.json());
  }

  deletePicture(id: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken(),
      'Database': this._userService.getDatabase()
    });
    return this._http.delete(Config.apiURL + "delete-image-company/" + id, { headers: headers }).map(res => res.json());
  }

  generateLicensePayment(payment) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken(),
      'Database': this._userService.getDatabase()
    });
    return this._http.get(Config.apiURL + 'generar-licencia-payment/'+ payment, { headers: headers }).map(res => res.json());
	}
	
	getCountry() {
		return this._http.get("https://restcountries.eu/rest/v2/all?fields=name;alpha2Code;timezones;alpha3Code;flag;callingCodes")
	}

	getTimeZone(country : string) {
		return this._http.get("https://restcountries.eu/rest/v2/alpha/"+country)
	}
}
