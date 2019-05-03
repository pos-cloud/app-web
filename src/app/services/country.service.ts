import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Config } from '../app.config';
import { UserService } from './user.service';
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { Country } from './../models/country';


import { Http, Headers } from '@angular/http';

@Injectable()
export class CountryService {

	constructor(
        public _http: Http,
        private http: HttpClient,
		public _userService: UserService
	) { }

    public getCountries(
        project: {},
        match: {},
        sort: {},
        group: {},
        limit: number = 0,
        skip: number = 0
    ): Observable<any> {

        const URL = `${Config.apiURL}/countries`;

        const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', this._userService.getToken())
        .set('Database', this._userService.getDatabase());
        //.set('Authorization', this._authService.getSession()["token"]);

        const params = new HttpParams()
        .set('project', JSON.stringify(project))
        .set('match', JSON.stringify(match))
        .set('sort', JSON.stringify(sort))
        .set('group', JSON.stringify(group))
        .set('limit', limit.toString())
        .set('skip', skip.toString());

        return this.http.get(URL, {
        headers: headers,
        params: params
        }).pipe(
            map(res => {
                return res;
            })
        );
    }

    public addCountry( country: Country): Observable<any> {
		let headers = new Headers({
		'Content-Type': 'application/json',
				'Authorization': this._userService.getToken(),
				'Database': this._userService.getDatabase()
    });
		return this._http.post(Config.apiURL + "country", country, { headers: headers }).map (res => res.json());
    }

    public updateCountry(country: Country): Observable<any> {
        
        const URL = `${Config.apiURL}country`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._userService.getToken())
            .set('Database', this._userService.getDatabase())
        
        const params = new HttpParams()
            .set('id', country._id);

        return this.http.put(URL, country, {
            headers: headers,
            params: params
        }).pipe(
            map(res => {
                return res;
            }),
        );
    }

    public deleteCountry (countryId: string): Observable<any> {
        
        const URL = `${Config.apiURL}country`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._userService.getToken())
            .set('Database', this._userService.getDatabase())
        
        const params = new HttpParams()
            .set('id', countryId);

        return this.http.delete(URL, {
            headers: headers,
            params: params
        }).pipe(
            map(res => {
                return res;
            }),
        );
    }

    public getCountry (countryId: string): Observable<any> {
        
        const URL = `${Config.apiURL}country`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._userService.getToken())
            .set('Database', this._userService.getDatabase());
        
        const params = new HttpParams()
            .set('id', countryId);

        return this.http.get(URL , {
            headers: headers,
            params: params
        }).pipe(
            map(res => {
                return res;
            }),
        );
    }
}
