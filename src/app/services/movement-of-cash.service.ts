import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { empty } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { MovementOfCash } from './../models/movement-of-cash';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class MovementOfCashService {

	constructor(
		private http: HttpClient,
		public _http: Http,
		public _authService: AuthService
	) { }

	getLastMovementOfCash() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + 'movements-of-cashes/sort="code":-1&limit=1', { headers: headers }).map(res => res.json());
	}

	getMovementOfCash(id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "movement-of-cash/" + id, { headers: headers }).map(res => res.json());
	}

	getMovementsOfCashes() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "movements-of-cashes", { headers: headers }).map(res => res.json());
  }

  getMovementsOfCashesByMovement(movement: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.get(Config.apiURL + "movements-of-cashes-by-transaction-movement/" + movement, { headers: headers }).map(res => res.json());
  }

	saveMovementOfCash(movementOfCash: MovementOfCash) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.post(Config.apiURL + "movement-of-cash", movementOfCash, { headers: headers }).map(res => res.json());
  }

  saveMovementsOfCashes(movementsOfCashes: MovementOfCash[]) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.post(Config.apiURL + "movements-of-cashes", { movementsOfCashes: movementsOfCashes }, { headers: headers }).map(res => res.json());
  }

	deleteMovementOfCash(id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.delete(Config.apiURL + "movement-of-cash/" + id, { headers: headers }).map(res => res.json());
  }

  deleteMovementsOfCashes(query: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.delete(Config.apiURL + "movements-of-cashes/" + query, { headers: headers }).map(res => res.json());
  }

	updateMovementOfCash(movementOfCash: MovementOfCash) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.put(Config.apiURL + "movement-of-cash/" + movementOfCash._id, movementOfCash, { headers: headers }).map(res => res.json());
	}

	getMovementOfCashesByTransaction(transactionId: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + 'movements-of-cashes/where="transaction":"' + transactionId + '"', { headers: headers }).map(res => res.json());
	}

	getMovementOfCurrentAccountByCompany(companyId: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "movements-of-cashes-by-company/" + companyId, { headers: headers }).map(res => res.json());
	}

	getCheck(number: string) {
		let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.get(Config.apiURL + 'movements-of-cashes/where="number":"' + number + '"' , { headers: headers }).map(res => res.json());
	}

	public getMovementsOfCashesV2(
    project: {},
    match: {},
    sort: {},
    group: {},
    limit: number = 0,
    skip: number = 0
  ): Observable<any> {

	const URL = `${Config.apiURL}v2/movements-of-cashes`;

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
}
