import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { MovementOfArticle } from './../models/movement-of-article';
import { Config } from './../app.config';
import { UserService } from './user.service';

@Injectable()
export class MovementOfArticleService {

  constructor(
    public _http: Http,
    public _userService: UserService
  ) { }

  getLastMovementOfArticle() {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken(),
      'Database': this._userService.getDatabase()
    });
    return this._http.get(Config.apiURL + 'movements-of-articles/sort="code":-1&limit=1', { headers: headers }).map (res => res.json());
	}

  getMovementOfArticle (id) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken(),
      'Database': this._userService.getDatabase()
    });
    return this._http.get(Config.apiURL + "movement-of-article/"+id, { headers: headers }).map (res => res.json());
	}

  getMovementsOfArticles () {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken(),
      'Database': this._userService.getDatabase()
    });
    return this._http.get(Config.apiURL + "movements-of-articles", { headers: headers }).map (res => res.json());
  }
  
  movementOfArticleExists(movementOfArticle: MovementOfArticle) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken(),
      'Database': this._userService.getDatabase()
    });
    return this._http.get(Config.apiURL + 'movements-of-articles/where="article":"' + movementOfArticle.article._id + '","transaction":"' + movementOfArticle.transaction._id + '"', { headers: headers }).map(res => res.json());
  }

  saveMovementOfArticle (movementOfArticle: MovementOfArticle) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken(),
      'Database': this._userService.getDatabase()
    });
    return this._http.post(Config.apiURL + "movement-of-article", movementOfArticle, { headers: headers }).map (res => res.json());
	}

  deleteMovementOfArticle(id: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken(),
      'Database': this._userService.getDatabase()
    });
    return this._http.delete(Config.apiURL + "movement-of-article/"+id, { headers: headers }).map (res => res.json());
  }

  updateMovementOfArticle(movementOfArticle: MovementOfArticle) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken(),
      'Database': this._userService.getDatabase()
    });
    return this._http.put(Config.apiURL + "movement-of-article/" + movementOfArticle._id, movementOfArticle, { headers: headers }).map (res => res.json());
  }

  getMovementsOfTransaction (transactionId: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken(),
      'Database': this._userService.getDatabase()
    });
    return this._http.get(Config.apiURL + 'movements-of-articles/where="transaction":"'+transactionId+'"', { headers: headers }).map (res => res.json());
	}
}