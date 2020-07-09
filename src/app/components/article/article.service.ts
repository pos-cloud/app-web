import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { of, BehaviorSubject } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Article } from './article';
import { Config } from '../../app.config';
import { AuthService } from '../login/auth.service';
import { Variant } from 'app/components/variant/variant';

@Injectable()
export class ArticleService {

  private items: BehaviorSubject<Article[]> = new BehaviorSubject<Article[]>(null);
  private countItems: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  private variants: BehaviorSubject<Article[]> = new BehaviorSubject<Article[]>(null);
  private countVariants: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  private articlesPos: BehaviorSubject<Article[]> = new BehaviorSubject<Article[]>(null);

	constructor(
		private _http: HttpClient,
		public _authService: AuthService
  ) { }

  public setItems(items: Article[], count: number): void {
    this.items.next(items);
    this.countItems.next(count);
  }

  public get getItems() {
    return this.items.asObservable();
  }

  public get getCountItems() {
    return this.countItems.asObservable();
  }

  public setVariants(variants: Article[], countVariants: number): void {
    this.variants.next(variants);
    this.countItems.next(countVariants);
  }

  public get getVariants() {
    return this.variants.asObservable();
  }

  public get getCountVariants() {
    return this.countVariants.asObservable();
  }

  public setArticlesPos(articlesPos: Article[]): void {
    this.articlesPos.next(articlesPos);
  }

  public get getArticlesPos() {
    return this.articlesPos.asObservable();
  }

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
				return of(err);
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
				return of(err);
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
				return of(err);
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
				return of(err);
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
				return of(err);
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
				return of(err);
			})
		);
	}

	public updatePrice(query: string, decimal: string): Observable<any> {

		const URL = `${Config.apiURL}update-prices`;

		const headers = new HttpHeaders()
			.set('Content-Type', 'application/json')
			.set('Authorization', this._authService.getToken());

		const params = new HttpParams()
			.set('decimal', decimal);

		return this._http.put(URL, query, {
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

	public deleteArticle(_id: string): Observable<any> {

		const URL = `${Config.apiURL}article`;

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

	public makeFileRequest(idArticle: String, files: Array<File>) {

		let xhr: XMLHttpRequest = new XMLHttpRequest();
		xhr.open('POST', Config.apiURL + 'upload-image-article/' + idArticle, true);
		xhr.setRequestHeader('Authorization', this._authService.getToken());

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

    public makeFileRequestArray(files: Array<File>) {

		let xhr: XMLHttpRequest = new XMLHttpRequest();
		xhr.open('POST', Config.apiURL + 'upload-image-article/', true);
		xhr.setRequestHeader('Authorization', this._authService.getToken());

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

    public deleteImage(picture: string): Observable<any> {

		const URL = `${Config.apiURL}delete-image-article`;

		const headers = new HttpHeaders()
			.set('Content-Type', 'application/json')
			.set('Authorization', this._authService.getToken());

		const params = new HttpParams()
			.set('picture', picture);

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

	public getPicture(picture: string): Observable<any> {

		const URL = `${Config.apiURL}get-image-base64-article`;

		const params = new HttpParams()
			.set('picture', picture);

		const headers = new HttpHeaders()
			.set('Content-Type', 'application/json')
			.set('Authorization', this._authService.getToken());

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
}
