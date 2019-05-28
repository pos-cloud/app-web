import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { User } from 'app/models/user';
import { Employee } from 'app/models/employee';
import { EmployeeType } from 'app/models/employee-type';
import { Http, Headers } from '@angular/http';
import { Config } from 'app/app.config';

@Injectable()
export class AuthService {
  
  private identity: BehaviorSubject<User> = new BehaviorSubject<User>(null);

  constructor(
    private _router: Router,
    public _http: Http
  ) { }

  get getIdentity() {

    let identity: User = JSON.parse(sessionStorage.getItem('user'));

    this.identity.next(identity);

    return this.identity.asObservable();
  }

  login(database: string, user: string, password: string) {
    let headers = new Headers({
      'Content-Type': 'application/json'
    });
    return this._http.post(Config.apiURL + "login", { 
                                                      database: database, 
                                                      user : user, 
                                                      password: password 
                                                    }, 
                                                    { headers: headers }).map (res => res.json());
	}

  register(data) {
    let headers = new Headers({
      'Content-Type': 'application/json'
    });
    return this._http.post(Config.apiURL + "register", data, { headers: headers }).map(res => res.json());
  }

  public loginStorage(user: User): void {
    let userStorage = new User();
    userStorage._id = user._id;
    userStorage.name = user.name;
    if (user.employee) {
      userStorage.employee = new Employee();
      userStorage.employee._id = user.employee._id;
      userStorage.employee.name = user.employee.name;
      userStorage.employee.type = new EmployeeType();
      userStorage.employee.type._id = user.employee.type._id;
      userStorage.employee.type.description = user.employee.type.description;
    }
    sessionStorage.setItem('user', JSON.stringify(userStorage));
    sessionStorage.setItem('session_token', user.token);
    this.identity.next(userStorage);
  }

  public logoutStorage(): void {
    sessionStorage.removeItem("session_token");
    sessionStorage.removeItem("user");
    this.identity.next(null);
    let hostname = window.location.hostname;
    let subdominio = '';
    if(hostname.includes('.poscloud.com.ar')) {
      subdominio = hostname.split('.poscloud.com.ar')[0]
                          .replace(/\//g, "")
                          .replace(/:/g, "")
                          .replace(/http/g, "")
                          .replace(/www./g, "")
                          .replace(/https/g, "");
    }
    Config.setDatabase(subdominio);
    this._router.navigate(['/login']);
  }

  isValidToken(token: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this.getToken()
    });
    return this._http.get(Config.apiURL + "validate_token/" + token.replace(/"/gi, ''), { headers: headers }).map(res => res.json());
  }

  checkPermission(employee: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this.getToken()
    });
    return this._http.get(Config.apiURL + "check_permission/" + employee, { headers: headers }).map(res => res.json());
  }

  getToken(): string {

    let token: string = sessionStorage.getItem('session_token');

    if (token !== undefined) {
      return token;
    } else {
      return undefined;
    }
  }
}