import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { User } from './../models/user';

@Injectable()
export class UserService {
  
  private url: string;

  constructor(private _http: Http) { 
    this.url = 'http://localhost:3000/api/';
  }

  getLastUser () {
		return this._http.get(this.url+'users/sort="code":-1&limit=1').map (res => res.json());
	}

  getUser (id) {
		return this._http.get(this.url+"user/"+id).map (res => res.json());
	}

  getUsers () {
		return this._http.get(this.url+"users").map (res => res.json());
	}

  login (user : User) {
		return this._http.post(this.url+"login",user).map (res => res.json());
	}

  saveUser (user : User) {
    return this._http.post(this.url+"user",user).map (res => res.json());
  }
  
  deleteUser (id: string) {
    return this._http.delete(this.url+"user/"+id).map (res => res.json());
  }

  updateUser (user: User){
    return this._http.put(this.url+"user/"+user._id, user).map (res => res.json());
  }
}
