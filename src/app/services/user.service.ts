import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { User } from './../models/user';
import { Config } from './../app.config';

@Injectable()
export class UserService {

  constructor(public _http: Http) { }

  getLastUser () {
		return this._http.get(Config.apiURL + 'users/sort="code":-1&limit=1').map (res => res.json());
	}

  getUser (id) {
		return this._http.get(Config.apiURL + "user/" + id).map (res => res.json());
	}

  getUsers (query?: string) {
		return this._http.get(Config.apiURL + "users" + query).map (res => res.json());
	}

  login (user : User) {
    return this._http.post(Config.apiURL + "login", user).map (res => res.json());
	}

  saveUser (user : User) {
    return this._http.post(Config.apiURL + "user", user).map (res => res.json());
  }
  
  deleteUser (id: string) {
    return this._http.delete(Config.apiURL + "user/" + id).map (res => res.json());
  }

  updateUser (user: User){
    return this._http.put(Config.apiURL + "user/" + user._id, user).map (res => res.json());
  }

  getUserOfEmployee (employeeId: string) {
		return this._http.get(Config.apiURL + 'users/where="employee":"' + employeeId+'"&limit=1').map (res => res.json());
  }
  
  isValidToken(token: string) {
    return this._http.get(Config.apiURL + "validate_token/" + token.replace(/"/gi, "")).map(res => res.json());
  }

  checkPermission(employee: string) {
    return this._http.get(Config.apiURL + "check_permission/" + employee).map(res => res.json());
  }
}
