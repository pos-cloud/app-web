import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { ArticleField } from './../models/article-field';
import { Config } from './../app.config';
import { UserService } from './user.service';

@Injectable()
export class ArticleFieldService {

	constructor(
		public _http: Http,
		public _userService: UserService
	) { }

	getLastArticleField () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'article-fields/sort="code":-1&limit=1', { headers: headers }).map (res => res.json());
	}

	getArticleField (id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "article-field/"+id, { headers: headers }).map (res => res.json());
	}

	getArticleFields () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "article-fields", { headers: headers }).map (res => res.json());
	}

	saveArticleField (articleField : ArticleField) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.post(Config.apiURL + "article-field",articleField, { headers: headers }).map (res => res.json());
	}
  
	deleteArticleField (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.delete(Config.apiURL + "article-field/"+id, { headers: headers }).map (res => res.json());
	}

	updateArticleField (articleField: ArticleField){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.put(Config.apiURL + "article-field/"+articleField._id, articleField, { headers: headers }).map (res => res.json());
	}
}
