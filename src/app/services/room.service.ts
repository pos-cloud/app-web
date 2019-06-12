import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { Room } from './../models/room';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class RoomService {

  constructor(
    public _http: Http,
    public _authService: AuthService
  ) { }

  getLastRoom () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + 'rooms/sort="description":-1&limit=1', { headers: headers }).map (res => res.json());
  }

  getRoom (id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "room/"+id, { headers: headers }).map (res => res.json());
  }

  getRooms () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "rooms", { headers: headers }).map (res => res.json());
  }

  saveRoom (room : Room) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.post(Config.apiURL + "room",room, { headers: headers }).map (res => res.json());
  }
  
  deleteRoom (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.delete(Config.apiURL + "room/"+id, { headers: headers }).map (res => res.json());
  }

  updateRoom (room: Room){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.put(Config.apiURL + "room/"+room._id, room, { headers: headers }).map (res => res.json());
  }
}