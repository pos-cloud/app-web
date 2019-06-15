import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { of } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Category } from './../models/category';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class CategoryService {

	constructor(
		private _http: HttpClient,
		private _authService: AuthService
	) { }
	
	public getCategory(_id: string): Observable<any> {

        const URL = `${Config.apiURL}category`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        const params = new HttpParams()
            .set('id', _id);

        return this._http.get(URL, {
            headers: headers,
            params: params
        }).pipe(
            map(res => {
                return res;
            }),
            catchError((err) => {
                return of(err);
            })
        );
	}
	
	public getCategories(
        query?: string
    ): Observable<any> {

        const URL = `${Config.apiURL}categories`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')           
            .set('Authorization', this._authService.getToken());

        const params = new HttpParams()
            .set('query', query);

        return this._http.get(URL, {
            headers: headers,
            params: params
        }).pipe(
            map(res => {
                return res;
            }),
            catchError((err) => {
                return of(err);
            })
        );
	}

	public getCategoriesV2(
        project: {},
        match: {},
        sort: {},
        group: {},
        limit: number = 0,
        skip: number = 0
    ): Observable<any> {

        const URL = `${Config.apiURL}v2/categories`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')           
            .set('Authorization', this._authService.getToken());

        const params = new HttpParams()
            .set('project', JSON.stringify(project))
            .set('match', JSON.stringify(match))
            .set('sort', JSON.stringify(sort))
            .set('group', JSON.stringify(group))
            .set('limit', limit.toString())
            .set('skip', skip.toString());

        return this._http.get(URL, {
            headers: headers,
            params: params
        }).pipe(
            map(res => {
                return res;
            }),
            catchError((err) => {
                return of(err);
            })
        );
    }
	
	public getSalesByCategory(
        query: string
    ): Observable<any> {

        const URL = `${Config.apiURL}sales-by-category`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')           
            .set('Authorization', this._authService.getToken());

        const params = new HttpParams()
            .set('query', query);

        return this._http.get(URL, {
            headers: headers,
            params: params
        }).pipe(
            map(res => {
                return res;
            }),
            catchError((err) => {
                return of(err);
            })
        );
    }

	public saveCategory(category : Category): Observable<any> {

        const URL = `${Config.apiURL}category`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        return this._http.post(URL, category, {
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

	public updateCategory(category: Category): Observable<any> {

        const URL = `${Config.apiURL}category`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        const params = new HttpParams()
            .set('id', category._id);

        return this._http.put(URL, category, {
            headers: headers,
            params: params
        }).pipe(
            map(res => {
                return res;
            }),
            catchError((err) => {
                return of(err);
            })
        );
    }

	public deleteCategory(_id: string): Observable<any> {

        const URL = `${Config.apiURL}category`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        const params = new HttpParams()
            .set('id', _id);

        return this._http.delete(URL, {
            headers: headers,
            params: params
        }).pipe(
            map(res => {
                return res;
            }),
            catchError((err) => {
                return of(err);
            })
        );
    }

	public makeFileRequest(idCategory: String, files: Array<File>) {

		let xhr: XMLHttpRequest = new XMLHttpRequest();
		xhr.open('POST', Config.apiURL + 'upload-image-category/' + idCategory, true);
		xhr.setRequestHeader('Authorization', this._authService.getToken());

		return new Promise((resolve, reject) => {
			let formData: any = new FormData();

			if(files && files.length > 0) {
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
}
