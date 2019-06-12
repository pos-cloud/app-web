import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { User } from './../models/user';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class UserService {

  constructor(
    public _http: Http,
    public _authService: AuthService
  ) { }

  getLastUser() {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.get(Config.apiURL + 'users/sort="code":-1&limit=1', { headers: headers }).map (res => res.json());
	}

  getUser(id) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.get(Config.apiURL + "user/" + id, { headers: headers }).map (res => res.json());
	}

  getUsers(query?: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.get(Config.apiURL + "users/" + query, { headers: headers }).map (res => res.json());
	}

  saveUser(user: User) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.post(Config.apiURL + "user", user, {headers: headers}).map (res => res.json());
  }

  deleteUser (id: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.delete(Config.apiURL + "user/" + id, { headers: headers }).map (res => res.json());
  }

  updateUser (user: User){
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.put(Config.apiURL + "user/" + user._id, user, { headers: headers }).map (res => res.json());
  }

  getUserOfEmployee(employeeId: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.get(Config.apiURL + 'users/where="employee":"' + employeeId + '"&limit=1', { headers: headers }).map (res => res.json());
  }
}
