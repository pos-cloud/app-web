import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { of } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Config } from '../../app.config';
import { AuthService } from '../../components/login/auth.service';
import { Claim } from 'app/layout/claim/claim';
import { ModelService } from 'app/components/model/model.service';

@Injectable()
export class ClaimService extends ModelService {

  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {
    super(
      `claims`, // PATH
      _http,
      _authService
    );
  }

	public saveClaim(claim: Claim): Observable<any> {

		const URL = `${Config.apiURL}claim`;

		const headers = new HttpHeaders()
			.set('Content-Type', 'application/json')
			.set('Authorization', this._authService.getToken());
		return this._http.post(URL, { claim: claim }, {
			headers: headers
		}).pipe(
			map(res => {
				return res;
			}),
			catchError((err) => {
				return of(err);
			})
		);
	}

	public makeFileRequest(files: Array<File>) {

		let xhr: XMLHttpRequest = new XMLHttpRequest();
		xhr.open('POST', Config.apiURL + 'upload-file-claim/', true);
		xhr.setRequestHeader('Authorization', this._authService.getToken());

		return new Promise((resolve, reject) => {
			let formData: any = new FormData();

			if (files && files.length > 0) {
				for (let i: number = 0; i < files.length; i++) {
					formData.append('file', files[i], files[i].name);
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

	public deleteFile(file: String): Observable<any> {

		const URL = `${Config.apiURL}file-claim/` + file;

		const headers = new HttpHeaders()
			.set('Content-Type', 'application/json')
			.set('Authorization', this._authService.getToken());
		return this._http.delete(URL, {
			headers: headers
		}).pipe(
			map(res => {
				return res;
			}),
			catchError((err) => {
				return of(err);
			})
		);
	}
}
