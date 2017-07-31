import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Article } from './../models/article';
import { Config } from './../app.config';

@Injectable()
export class ArticleService {

  constructor(public _http: Http) { }

  getLastArticle () {
		return this._http.get(Config.apiURL + 'articles/sort="code":-1&limit=1').map (res => res.json());
	}

  getArticle (id) {
		return this._http.get(Config.apiURL + "article/"+id).map (res => res.json());
	}

  getArticles () {
		return this._http.get(Config.apiURL + "articles").map (res => res.json());
	}

  saveArticle (article : Article) {
    return this._http.post(Config.apiURL + "article",article).map (res => res.json());
  }
  
  deleteArticle (id: string) {
    return this._http.delete(Config.apiURL + "article/"+id).map (res => res.json());
  }

  updateArticle (article: Article){
    return this._http.put(Config.apiURL + "article/"+article._id, article).map (res => res.json());
  }

  getArticlesByCategory (categoryId: string) {
		return this._http.get(Config.apiURL + 'articles/where="category":"'+categoryId+'"').map (res => res.json());
	}

  uploadImagen (id : string){
    return this._http.post(Config.apiURL + "upload-imagen/"+id,"").map (res => res.json());
  }
}
