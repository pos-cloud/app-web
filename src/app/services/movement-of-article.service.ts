import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { MovementOfArticle } from './../models/movement-of-article';
import { Config } from './../app.config';

@Injectable()
export class MovementOfArticleService {

  constructor(public _http: Http) { }

  getLastMovementOfArticle () {
    return this._http.get(Config.apiURL + 'movements-of-articles/sort="code":-1&limit=1').map (res => res.json());
	}

  getMovementOfArticle (id) {
		return this._http.get(Config.apiURL + "movement-of-article/"+id).map (res => res.json());
	}

  getMovementsOfArticles () {
		return this._http.get(Config.apiURL + "movements-of-articles").map (res => res.json());
	}

  saveMovementOfArticle (movementOfArticle: MovementOfArticle) {
		return this._http.post(Config.apiURL + "movement-of-article", movementOfArticle).map (res => res.json());
	}

  deleteMovementOfArticle (id: string) {
    return this._http.delete(Config.apiURL + "movement-of-article/"+id).map (res => res.json());
  }

  updateMovementOfArticle (movementOfArticle: MovementOfArticle){
    return this._http.put(Config.apiURL + "movement-of-article/" + movementOfArticle._id, movementOfArticle).map (res => res.json());
  }

  getMovementsOfTransaction (transactionId: string) {
		return this._http.get(Config.apiURL + 'movements-of-articles/where="transaction":"'+transactionId+'"').map (res => res.json());
	}
}