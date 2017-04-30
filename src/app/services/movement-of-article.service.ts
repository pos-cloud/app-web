import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { MovementOfArticle } from './../models/movement-of-article';

@Injectable()
export class MovementOfArticleService {

  private url: string;

  constructor(private _http: Http) {
    this.url = 'http://localhost:3000/api/';
  }

  getLastMovementOfArticle () {
		return this._http.get(this.url+"last-movement-of-article").map (res => res.json());
	}

  getMovementOfArticle (id) {
		return this._http.get(this.url+"movement-of-article/"+id).map (res => res.json());
	}

  getMovementsOfArticle () {
		return this._http.get(this.url+"movement-of-article").map (res => res.json());
	}

  saveMovementOfArticle (movementOfArticle: MovementOfArticle) {
		return this._http.post(this.url+"movement-of-article", movementOfArticle).map (res => res.json());
	}

  deleteMovementOfArticle (id: string) {
    return this._http.delete(this.url+"movement-of-article/"+id).map (res => res.json());
  }

  updateMovementOfArticle (id: string, movementOfArticle: MovementOfArticle){
    return this._http.put(this.url+"movement-of-article/"+id, movementOfArticle).map (res => res.json());
  }
}