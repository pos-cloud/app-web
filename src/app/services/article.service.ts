import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { empty } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Article, ArticleType } from './../models/article';
import { Config } from './../app.config';
import { AuthService } from './auth.service';
import { Variant } from 'app/models/variant';

@Injectable()
export class ArticleService {

	constructor(
		private _http: HttpClient,
		public _authService: AuthService
	) { }

	public getArticle(_id: string): Observable<any> {

        const URL = `${Config.apiURL}article`;

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
                return empty();
            })
        );
	}
	
	public getArticles(
        query?: string
    ): Observable<any> {

        const URL = `${Config.apiURL}articles`;

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
                return empty();
            })
        );
    }

    public getArticlesV2(
        project: {},
        match: {},
        sort: {},
        group: {},
        limit: number = 0,
        skip: number = 0
    ): Observable<any> {

        const URL = `${Config.apiURL}v2/articles`;

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
                return empty();
            })
        );
	}

	public getBestSellingArticle(
        query?: string
    ): Observable<any> {

        const URL = `${Config.apiURL}get-best-selling-article`;

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
                return empty();
            })
        );
    }

	public saveArticle(article: Article, variants: Variant[]): Observable<any> {

        const URL = `${Config.apiURL}article`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        return this._http.post(URL, { article: article, variants: variants }, {
            headers: headers
        }).pipe(
            map(res => {
                return res;
            }),
            catchError((err) => {
                return empty();
            })
        );
    }

	public updateArticle(article: Article, variants: Variant[]): Observable<any> {

        const URL = `${Config.apiURL}article`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        const params = new HttpParams()
            .set('id', article._id);

        return this._http.put(URL, { article: article, variants: variants }, {
            headers: headers,
            params: params
        }).pipe(
            map(res => {
                return res;
            }),
            catchError((err) => {
                return empty();
            })
        );
    }

	public updatePrice(query: string): Observable<any> {

        const URL = `${Config.apiURL}update-prices`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        return this._http.put(URL, query, {
            headers: headers
        }).pipe(
            map(res => {
                return res;
            }),
            catchError((err) => {
                return empty();
            })
        );
	}
	
	public deleteArticleField(_id: string): Observable<any> {

        const URL = `${Config.apiURL}article`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')

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
                return empty();
            })
        );
    }

	public makeFileRequest(idArticle: String, files: Array<File>) {

		let xhr: XMLHttpRequest = new XMLHttpRequest();
		xhr.open('POST', Config.apiURL + 'upload-image-article/' + idArticle, true);
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
