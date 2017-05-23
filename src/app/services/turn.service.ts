import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Turn, TurnState } from './../models/turn';

@Injectable()
export class TurnService {
  
  private url: string;

  constructor(private _http: Http) { 
    this.url = 'http://localhost:3000/api/';
  }

  getOpenTurn (waiterId: string) {
		return this._http.get(this.url+'turns/where="waiter":"'+waiterId+'","state":"'+TurnState.Open+'"').map (res => res.json());
	}

  getLastTurn () {
    return this._http.get(this.url+'turns/sort="code":-1&limit=1').map (res => res.json());
  }

  getTurn (id) {
    return this._http.get(this.url+"turn/"+id).map (res => res.json());
  }

  getTurns () {
    return this._http.get(this.url+"turns").map (res => res.json());
  }

  saveTurn (turn : Turn) {
    return this._http.post(this.url+"turn",turn).map (res => res.json());
  }
  
  deleteTurn (id: string) {
    return this._http.delete(this.url+"turn/"+id).map (res => res.json());
  }

  updateTurn (turn: Turn){
    return this._http.put(this.url+"turn/"+turn._id, turn).map (res => res.json());
  }
}
