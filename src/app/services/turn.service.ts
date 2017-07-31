import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Turn, TurnState } from './../models/turn';
import { Config } from './../app.config';

@Injectable()
export class TurnService {

  constructor(public _http: Http) { }

  getOpenTurn (employeeId: string) {
		return this._http.get(Config.apiURL + 'turns/where="employee":"'+employeeId+'","state":"'+TurnState.Open+'"').map (res => res.json());
	}

  getLastTurn () {
    return this._http.get(Config.apiURL + 'turns/sort="code":-1&limit=1').map (res => res.json());
  }

  getTurn (id) {
    return this._http.get(Config.apiURL + "turn/"+id).map (res => res.json());
  }

  getTurns () {
    return this._http.get(Config.apiURL + "turns").map (res => res.json());
  }

  saveTurn (turn : Turn) {
    return this._http.post(Config.apiURL + "turn",turn).map (res => res.json());
  }
  
  deleteTurn (id: string) {
    return this._http.delete(Config.apiURL + "turn/"+id).map (res => res.json());
  }

  updateTurn (turn: Turn){
    return this._http.put(Config.apiURL + "turn/"+turn._id, turn).map (res => res.json());
  }
}
