import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Waiter } from './../models/waiter';

@Injectable()
export class WaiterService {

  private url: string;

  constructor(private _http: Http) {
    this.url = 'http://localhost:3000/api/';
  }

  getLastWaiter () {
		return this._http.get(this.url+"last-waiter").map (res => res.json());
	}

  getWaiter (id) {
		return this._http.get(this.url+"waiter/"+id).map (res => res.json());
	}

  getWaiters () {
		return this._http.get(this.url+"waiters").map (res => res.json());
	}

  saveWaiter (waiter: Waiter) {
		return this._http.post(this.url+"waiter",waiter).map (res => res.json());
	}

  deleteWaiter (id: string) {
    return this._http.delete(this.url+"waiter/"+id).map (res => res.json());
  }

  updateWaiter (id: string, waiter: Waiter){
    return this._http.put(this.url+"waiter/"+id, waiter).map (res => res.json());
  }
}