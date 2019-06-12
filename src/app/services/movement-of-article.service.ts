import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { MovementOfArticle } from './../models/movement-of-article';
import { Config } from './../app.config';
import { AuthService } from './auth.service';


import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";

@Injectable()
export class MovementOfArticleService {

  constructor(
    public _http: Http,
		private http: HttpClient,
    public _authService: AuthService
  ) { }

  getLastMovementOfArticle() {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.get(Config.apiURL + 'movements-of-articles/sort="code":-1&limit=1', { headers: headers }).map (res => res.json());
	}

  getMovementOfArticle (id) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.get(Config.apiURL + "movement-of-article/"+id, { headers: headers }).map (res => res.json());
	}

  getMovementsOfArticles (query?: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    if (query) {
      return this._http.get(Config.apiURL + 'movements-of-articles/' + query, { headers: headers }).map (res => res.json());
    } else {
      return this._http.get(Config.apiURL + "movements-of-articles", { headers: headers }).map(res => res.json());
    }
  }

  movementOfArticleExists(articleId: string, transactionId: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.get(Config.apiURL + 'movements-of-articles/where="article":"' + articleId + '","transaction":"' + transactionId + '"', { headers: headers }).map(res => res.json());
  }

  saveMovementOfArticle (movementOfArticle: MovementOfArticle) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.post(Config.apiURL + "movement-of-article", movementOfArticle, { headers: headers }).map (res => res.json());
	}

  deleteMovementOfArticle(id: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.delete(Config.apiURL + "movement-of-article/"+id, { headers: headers }).map (res => res.json());
  }

  deleteMovementsOfArticles(query: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.delete(Config.apiURL + 'movements-of-articles/' + query, { headers: headers }).map(res => res.json());
  }

  updateMovementOfArticle(movementOfArticle: MovementOfArticle) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.put(Config.apiURL + "movement-of-article/" + movementOfArticle._id, movementOfArticle, { headers: headers }).map (res => res.json());
  }

  getMovementsOfTransaction (transactionId: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });

    return this._http.get(Config.apiURL + 'movements-of-articles/where="transaction":"'+transactionId+'"', { headers: headers }).map (res => res.json());
  }
  
  saveMovementsOfArticles(movementsOfArticles: MovementOfArticle[]) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.post(Config.apiURL + "movements-of-articles", { movementsOfArticles: movementsOfArticles }, { headers: headers }).map(res => res.json());
  }

  public getMovementsOfArticlesV2(
    project: {},
    match: {},
    sort: {},
    group: {},
    limit: number = 0,
    skip: number = 0
  ): Observable<any> {

	const URL = `${Config.apiURL}v2/movements-of-articles`;

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
