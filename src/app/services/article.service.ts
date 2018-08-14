import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Article, ArticleType } from './../models/article';
import { Config } from './../app.config';
import { UserService } from './user.service';

@Injectable()
export class ArticleService {

	constructor(
		public _http: Http,
		public _userService: UserService
	) { }

	getLastArticle () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'articles/sort="code":-1&limit=1', { headers: headers }).map (res => res.json());
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
		if(query) {
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

	saveArticle(article: Article) {
		let headers = new Headers({
		'Content-Type': 'application/json',
				'Authorization': this._userService.getToken(),
				'Database': this._userService.getDatabase()
		});
		return this._http.post(Config.apiURL + "article",article, { headers: headers }).map (res => res.json());
	}
  
	deleteArticle (id: string) {
			let headers = new Headers({
				'Content-Type': 'application/json',
				'Authorization': this._userService.getToken(),
				'Database': this._userService.getDatabase()
			});
			return this._http.delete(Config.apiURL + "article/"+id, { headers: headers }).map (res => res.json());
	}

	updateArticle (article: Article){
			let headers = new Headers({
				'Content-Type': 'application/json',
				'Authorization': this._userService.getToken(),
				'Database': this._userService.getDatabase()
			});
			return this._http.put(Config.apiURL + "article/"+article._id, article, { headers: headers }).map (res => res.json());
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
		return this._http.post(Config.apiURL + "upload-image/"+id,"", { headers: headers }).map (res => res.json());
	}
	
	public makeFileRequest(idArticle: String, files: Array<File>) {

		let xhr: XMLHttpRequest = new XMLHttpRequest();
		xhr.open('POST', Config.apiURL + 'upload-image-article/' + idArticle, true);
		xhr.setRequestHeader('Authorization', this._userService.getToken());
		xhr.setRequestHeader('Database', this._userService.getDatabase());

		return new Promise(function (resolve, reject) {
			let formData: any = new FormData();

			for (let i: number = 0; i < files.length; i++) {
				formData.append('image', files[i], files[i].name);
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
