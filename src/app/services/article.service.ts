import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Article } from './../models/article';

@Injectable()
export class ArticleService {
  
  private url: string;

  constructor(private _http: Http) { 
    this.url = 'http://localhost:3000/api/';
  }

  getLastArticle () {
		return this._http.get(this.url+'articles/sort="code":-1&limit=1').map (res => res.json());
	}

  getArticle (id) {
		return this._http.get(this.url+"article/"+id).map (res => res.json());
	}

  getArticles () {
		return this._http.get(this.url+"articles").map (res => res.json());
	}

  saveArticle (article : Article) {
    return this._http.post(this.url+"article",article).map (res => res.json());
  }
  
  deleteArticle (id: string) {
    return this._http.delete(this.url+"article/"+id).map (res => res.json());
  }

  updateArticle (article: Article){
    return this._http.put(this.url+"article/"+article._id, article).map (res => res.json());
  }
}
