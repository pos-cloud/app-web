import { Injectable } from "@angular/core";
import { Router } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, of } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { User } from 'app/components/user/user';
import { Config } from 'app/app.config';

@Injectable()
export class AuthService {

    private identity: BehaviorSubject<User> = new BehaviorSubject<User>(null);

    constructor(
        private _router: Router,
        private _http: HttpClient
    ) { }

    get getIdentity() {

        let identity: User = JSON.parse(sessionStorage.getItem('user'));

        this.identity.next(identity);

        return this.identity.asObservable();
    }

    public login(database: string, user: string, password: string): Observable<any> {

        const URL = `${Config.apiURL}login`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json');

        return this._http.post(URL, {
            database: database,
            user: user,
            password: password
        }, {
            headers: headers
        }).pipe(
            map(res => {
                return res;
            }),
            catchError((err) => {
                return of(err);
            })
        );
    }

    public register(data): Observable<any> {

        const URL = `${Config.apiURL}register`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json');

        return this._http.post(URL, data, {
            headers: headers
        }).pipe(
            map(res => {
                return res;
            }),
            catchError((err) => {
                return of(err);
            })
        );
    }

    public loginStorage(user: User): void {
        let userStorage = new User();
        userStorage._id = user._id;
        userStorage.name = user.name;
        userStorage.employee = user.employee;
        userStorage.origin = user.origin;
        userStorage.cashBoxType = user.cashBoxType;
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
        if (hostname.includes('.poscloud.com.ar')) {
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

    public isValidToken(token: string): Observable<any> {

        const URL = `${Config.apiURL}validate_token`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this.getToken());

        const params = new HttpParams()
            .set('token', token.replace(/"/gi, ''));

        return this._http.get(URL, {
            headers: headers,
            params: params
        }).pipe(
            map(res => {
                return res;
            }),
            catchError((err) => {
                return of(err);
            })
        );
    }

    public checkPermission(employee: string): Observable<any> {

        const URL = `${Config.apiURL}check_permission`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this.getToken());

        const params = new HttpParams()
            .set('employee', employee);

        return this._http.get(URL, {
            headers: headers,
            params: params
        }).pipe(
            map(res => {
                return res;
            }),
            catchError((err) => {
                return of(err);
            })
        );
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