import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Room } from './../models/room';

@Injectable()
export class RoomService {
  
  public url: string;

  constructor(public _http: Http) { 
    this.url = 'http://localhost:3000/api/';
  }

  getLastRoom () {
    return this._http.get(this.url+'rooms/sort="description":-1&limit=1').map (res => res.json());
  }

  getRoom (id) {
    return this._http.get(this.url+"room/"+id).map (res => res.json());
  }

  getRooms () {
    return this._http.get(this.url+"rooms").map (res => res.json());
  }

  saveRoom (room : Room) {
    return this._http.post(this.url+"room",room).map (res => res.json());
  }
  
  deleteRoom (id: string) {
    return this._http.delete(this.url+"room/"+id).map (res => res.json());
  }

  updateRoom (room: Room){
    return this._http.put(this.url+"room/"+room._id, room).map (res => res.json());
  }
}