import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { Turn, TurnState } from './../models/turn';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class TurnService {

  constructor(
    public _http: Http,
    public _authService: AuthService
  ) { }

  getOpenTurn(employeeId: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.get(Config.apiURL + 'turns/where="employee":"' + employeeId + '","state":"' + TurnState.Open + '"', { headers: headers }).map (res => res.json());
	}

  getLastTurn() {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.get(Config.apiURL + 'turns/sort="code":-1&limit=1', { headers: headers }).map (res => res.json());
  }

  getTurn(id) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.get(Config.apiURL + "turn/" + id, { headers: headers }).map (res => res.json());
  }

  getTurns() {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.get(Config.apiURL + "turns", { headers: headers }).map (res => res.json());
  }

  getShiftClosingByTransaction(turnId: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.get(Config.apiURL + "shift-closing-by-transaction/" + turnId, { headers: headers }).map(res => res.json());
  }

  getShiftClosingByMovementOfCash(turnId: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.get(Config.apiURL + "shift-closing-by-payment-method/" + turnId, { headers: headers }).map(res => res.json());
  }

  getShiftClosingByMovementOfArticle(turnId: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.get(Config.apiURL + "shift-closing-by-article/" + turnId, { headers: headers }).map(res => res.json());
  }

  saveTurn(turn: Turn) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.post(Config.apiURL + "turn", turn, { headers: headers }).map (res => res.json());
  }
  
  deleteTurn(id: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.delete(Config.apiURL + "turn/" + id, { headers: headers }).map (res => res.json());
  }

  updateTurn(turn: Turn) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.put(Config.apiURL + "turn/" + turn._id, turn, { headers: headers }).map (res => res.json());
  }
}
