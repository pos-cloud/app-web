import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { MovementOfCash } from './../models/movement-of-cash';
import { Config } from './../app.config';
import { UserService } from './user.service';

@Injectable()
export class MovementOfCashService {

	constructor(
		public _http: Http,
		public _userService: UserService
	) { }

	getLastMovementOfCash() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'movements-of-cashes/sort="code":-1&limit=1', { headers: headers }).map(res => res.json());
	}

	getMovementOfCash(id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "movement-of-cash/" + id, { headers: headers }).map(res => res.json());
	}

	getMovementsOfCashes() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "movements-of-cashes", { headers: headers }).map(res => res.json());
  }

  getMovementsOfCashesByMovement(movement: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken(),
      'Database': this._userService.getDatabase()
    });
    return this._http.get(Config.apiURL + "movements-of-cashes-by-transaction-movement/" + movement, { headers: headers }).map(res => res.json());
  }

	saveMovementOfCash(movementOfCash: MovementOfCash) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.post(Config.apiURL + "movement-of-cash", movementOfCash, { headers: headers }).map(res => res.json());
  }

  saveMovementsOfCashes(movementsOfCashes: MovementOfCash[]) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken(),
      'Database': this._userService.getDatabase()
    });
    return this._http.post(Config.apiURL + "movements-of-cashes", { movementsOfCashes: movementsOfCashes }, { headers: headers }).map(res => res.json());
  }

	deleteMovementOfCash(id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.delete(Config.apiURL + "movement-of-cash/" + id, { headers: headers }).map(res => res.json());
  }

  deleteMovementsOfCashes(query: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken(),
      'Database': this._userService.getDatabase()
    });
    return this._http.delete(Config.apiURL + "movements-of-cashes/" + query, { headers: headers }).map(res => res.json());
  }

	updateMovementOfCash(movementOfCash: MovementOfCash) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.put(Config.apiURL + "movement-of-cash/" + movementOfCash._id, movementOfCash, { headers: headers }).map(res => res.json());
	}

	getMovementOfCashesByTransaction(transactionId: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'movements-of-cashes/where="transaction":"' + transactionId + '"', { headers: headers }).map(res => res.json());
	}

	getMovementOfCurrentAccountByCompany(companyId: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "movements-of-cashes-by-company/" + companyId, { headers: headers }).map(res => res.json());
	}
}
