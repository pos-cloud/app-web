import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Room } from './../models/room';
import { Config } from './../app.config';

@Injectable()
export class RoomService {
  
  constructor(public _http: Http) { }

  getLastRoom () {
    return this._http.get(Config.apiURL + 'rooms/sort="description":-1&limit=1').map (res => res.json());
  }

  getRoom (id) {
    return this._http.get(Config.apiURL + "room/"+id).map (res => res.json());
  }

  getRooms () {
    return this._http.get(Config.apiURL + "rooms").map (res => res.json());
  }

  saveRoom (room : Room) {
    return this._http.post(Config.apiURL + "room",room).map (res => res.json());
  }
  
  deleteRoom (id: string) {
    return this._http.delete(Config.apiURL + "room/"+id).map (res => res.json());
  }

  updateRoom (room: Room){
    return this._http.put(Config.apiURL + "room/"+room._id, room).map (res => res.json());
  }
}