import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { User } from './../models/user';
import { Config } from './../app.config';

@Injectable()
export class UserService {

  constructor(public _http: Http) { }

  getLastUser() {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this.getToken(),
			'Database': this.getDatabase()
    });
    return this._http.get(Config.apiURL + 'users/sort="code":-1&limit=1', { headers: headers }).map (res => res.json());
	}

  getUser(id) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this.getToken(),
			'Database': this.getDatabase()
    });
    return this._http.get(Config.apiURL + "user/" + id, { headers: headers }).map (res => res.json());
	}

  getUsers(query?: string, when?: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this.getToken(),
			'Database': this.getDatabase()
    });
    return this._http.get(Config.apiURL + "users/" + query, { headers: headers }).map (res => res.json());
	}

  login(user: User) {

    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this.getToken(),
			'Database': this.getDatabase()
    });
    return this._http.post(Config.apiURL + "login", user, { headers: headers }).map (res => res.json());
	}

  saveUser(user: User) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this.getToken(),
			'Database': this.getDatabase()
    });
    return this._http.post(Config.apiURL + "user", user, {headers: headers}).map (res => res.json());
  }

  register(data) {
    let headers = new Headers({
      'Content-Type': 'application/json'
    });
    return this._http.post(Config.apiURL + "register", data, { headers: headers }).map(res => res.json());
  }
  
  deleteUser (id: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this.getToken(),
			'Database': this.getDatabase()
    });
    return this._http.delete(Config.apiURL + "user/" + id, { headers: headers }).map (res => res.json());
  }

  updateUser (user: User){
    let headers = new Headers({ 
      'Content-Type': 'application/json',
      'Authorization': this.getToken(),
			'Database': this.getDatabase()
    });
    return this._http.put(Config.apiURL + "user/" + user._id, user, { headers: headers }).map (res => res.json());
  }

  getUserOfEmployee(employeeId: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this.getToken(),
			'Database': this.getDatabase()
    });
    return this._http.get(Config.apiURL + 'users/where="employee":"' + employeeId + '"&limit=1', { headers: headers }).map (res => res.json());
  }
  
  isValidToken(token: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this.getToken(),
			'Database': this.getDatabase()
    });
    return this._http.get(Config.apiURL + "validate_token/" + token.replace(/"/gi, ""), { headers: headers }).map(res => res.json());
  }

  checkPermission(employee: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this.getToken(),
			'Database': this.getDatabase()
    });
    return this._http.get(Config.apiURL + "check_permission/" + employee, { headers: headers }).map(res => res.json());
  }

  getIdentity(): User {
    
    let identity: User = JSON.parse(sessionStorage.getItem('user'));
    
    if(identity !== undefined && identity !== null) {
      return identity;
    } else {
      return undefined;
    }
  }

  getToken(): string {

    let token: string = sessionStorage.getItem('session_token');

    if (token !== undefined) {
      return token;
    } else {
      return undefined;
    }
  }

  getDatabase(): string {

    let database: string = localStorage.getItem('database');

    if (database !== undefined) {
      return database;
    } else {
      return undefined;
    }
  }
}
