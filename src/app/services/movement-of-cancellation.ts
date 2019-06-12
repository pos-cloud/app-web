import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { empty } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Config } from '../app.config';
import { MovementOfCancellation } from 'app/models/movement-of-cancellation';
import { AuthService } from './auth.service';

@Injectable()
export class MovementOfCancellationService {

	constructor(
        public _http: Http,
        private http: HttpClient,
		public _authService: AuthService
	) { }

    public getMovementsOfCancellations(
        project: {},
        match: {},
        sort: {},
        group: {},
        limit: number = 0,
        skip: number = 0
    ): Observable<any> {

        const URL = `${Config.apiURL}/movements-of-cancellations`;

        const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', this._authService.getToken());

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

    saveMovementOfCancellation (movementOfCancellation: MovementOfCancellation) {
        let headers = new Headers({
          'Content-Type': 'application/json',
          'Authorization': this._authService.getToken()
        });
        return this._http.post(Config.apiURL + "movement-of-cancellation", movementOfCancellation, { headers: headers }).map (res => res.json());
    }

    saveMovementsOfCancellations (movementsOfCancellations: MovementOfCancellation[]) {
        let headers = new Headers({
          'Content-Type': 'application/json',
          'Authorization': this._authService.getToken()
        });
        return this._http.post(Config.apiURL + "movements-of-cancellations", { movementsOfCancellations: movementsOfCancellations }, { headers: headers }).map (res => res.json());
    }

    updateMovementOfCancellation(movementOfCancellation: MovementOfCancellation) {
        
        const URL = `${Config.apiURL}movement-of-cancellation`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());
        
        const params = new HttpParams()
            .set('id', movementOfCancellation._id);

        return this.http.put(URL, movementOfCancellation, {
            headers: headers,
            params: params
        }).pipe(
            map(res => {
                return res;
            }),
        );
    }

    deleteMovementOfCancellation(movementOfCancellationId: string) {
        
        const URL = `${Config.apiURL}movement-of-cancellation/`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        return this.http.delete(URL + movementOfCancellationId , {
            headers: headers,
        }).pipe(
            map(res => {
                return res;
            }),
        );
    }

    deleteMovementsOfCancellations(query: string) {
        let headers = new Headers({
          'Content-Type': 'application/json',
          'Authorization': this._authService.getToken()
        });
        return this._http.delete(Config.apiURL + 'movements-of-cancellations/' + query, { headers: headers }).map(res => res.json());
      }

    getMovementOfCancellation( movementOfCancellationId: string){
        
        const URL = `${Config.apiURL}movement-of-cancellation/`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());
        

        return this.http.get(URL +  movementOfCancellationId , {
            headers: headers,
        }).pipe(
            map(res => {
                return res;
            }),
        );
    }

}
