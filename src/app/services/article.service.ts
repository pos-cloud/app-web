import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Article, ArticleType } from './../models/article';
import { Config } from './../app.config';
import { UserService } from './user.service';
import { Variant } from 'app/models/variant';

import { Observable } from "rxjs/Observable";
import { map } from "rxjs/operators";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";

@Injectable()
export class ArticleService {

	constructor(
		public _http: Http,
		private http: HttpClient,
		public _userService: UserService
	) { }

	getLastArticle () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'articles/sort="_id":-1&limit=1', { headers: headers }).map (res => res.json());
	}

 	getArticle (id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "article/"+id, { headers: headers }).map (res => res.json());
	}

  	getArticles (query?: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		if (query) {
			return this._http.get(Config.apiURL + "articles/" + query, { headers: headers }).map(res => res.json());
		} else {
			return this._http.get(Config.apiURL + "articles", { headers: headers }).map (res => res.json());
		}
	}

	getFinalArticles() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'articles/where="type":"' + ArticleType.Final + '"', { headers: headers }).map(res => res.json());
	}

  saveArticle(article: Article, variants: Variant[]) {
		let headers = new Headers({
		'Content-Type': 'application/json',
				'Authorization': this._userService.getToken(),
				'Database': this._userService.getDatabase()
    });
		return this._http.post(Config.apiURL + "article", { "article": article, "variants": variants }, { headers: headers }).map (res => res.json());
	}

	deleteArticle (id: string) {
			let headers = new Headers({
				'Content-Type': 'application/json',
				'Authorization': this._userService.getToken(),
				'Database': this._userService.getDatabase()
			});
			return this._http.delete(Config.apiURL + "article/"+id, { headers: headers }).map (res => res.json());
	}

  updateArticle(article: Article, variants: Variant[]){
			let headers = new Headers({
				'Content-Type': 'application/json',
				'Authorization': this._userService.getToken(),
				'Database': this._userService.getDatabase()
			});
    return this._http.put(Config.apiURL + "article/" + article._id, { "article": article, "variants": variants }, { headers: headers }).map (res => res.json());
	}

  	getArticlesByCategory (categoryId: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'articles/where="category":"'+categoryId+'"', { headers: headers }).map (res => res.json());
	}

  	uploadImagen (id : string){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.post(Config.apiURL + "upload-image/"+id,'', { headers: headers }).map (res => res.json());
	}

	public makeFileRequest(idArticle: String, files: Array<File>) {

		let xhr: XMLHttpRequest = new XMLHttpRequest();
		xhr.open('POST', Config.apiURL + 'upload-image-article/' + idArticle, true);
		xhr.setRequestHeader('Authorization', this._userService.getToken());
		xhr.setRequestHeader('Database', this._userService.getDatabase());

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

	public getBestSellingArticle(query: string) {

		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});

		return this._http.get(Config.apiURL + "get-best-selling-article/" + query, { headers: headers }).map(res => res.json());
	}

	public updatePrice(query: string) {

		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});

		return this._http.put(Config.apiURL + "update-prices", query ,{ headers: headers}).map(res => res.json());
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
      .set('Authorization', this._userService.getToken())
      .set('Database', this._userService.getDatabase());

    const params = new HttpParams()
      .set('project', JSON.stringify(project))
      .set('match', JSON.stringify(match))
      .set('sort', JSON.stringify(sort))
      .set('group', JSON.stringify(group))
      .set('limit', limit.toString())
      .set('skip', skip.toString());

    return this.http.get(URL, {
      headers: headers,
      params: params
    }).pipe(
      map(res => {
        return res;
      })
    );
  }
}
