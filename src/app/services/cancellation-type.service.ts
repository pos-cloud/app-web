import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Config } from '../app.config';
import { UserService } from './user.service';
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { CancellationType } from './../models/cancellation-type';


import { Http, Headers } from '@angular/http';

@Injectable()
export class CancellationTypeService {

	constructor(
        public _http: Http,
        private http: HttpClient,
		public _userService: UserService
	) { }

    public getCancellationTypes(
        project: {},
        match: {},
        sort: {},
        group: {},
        limit: number = 0,
        skip: number = 0
    ): Observable<any> {

        const URL = `${Config.apiURL}/cancellation-types`;

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

    addCancellationType( cancellationType: CancellationType,) {
		let headers = new Headers({
		'Content-Type': 'application/json',
				'Authorization': this._userService.getToken(),
				'Database': this._userService.getDatabase()
    });
		return this._http.post(Config.apiURL + "cancellation-type", cancellationType, { headers: headers }).map (res => res.json());
    }

    updateCancellationType(cancellationType: CancellationType){
        
        const URL = `${Config.apiURL}cancellation-type`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._userService.getToken())
            .set('Database', this._userService.getDatabase())
        
        const params = new HttpParams()
            .set('id', cancellationType._id);

        return this.http.put(URL, cancellationType, {
            headers: headers,
            params: params
        }).pipe(
            map(res => {
                return res;
            }),
        );
    }

    deleteCancellationType(cancellationTypeId: string){
        
        const URL = `${Config.apiURL}cancellation-type/`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._userService.getToken())
            .set('Database', this._userService.getDatabase())
        

        return this.http.delete(URL + cancellationTypeId , {
            headers: headers,
        }).pipe(
            map(res => {
                return res;
            }),
        );
    }

    getCancellationType(cancellationTypeId: string){
        
        const URL = `${Config.apiURL}cancellation-type/`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._userService.getToken())
            .set('Database', this._userService.getDatabase())
        

        return this.http.get(URL + cancellationTypeId , {
            headers: headers,
        }).pipe(
            map(res => {
                return res;
            }),
        );
    }


}
