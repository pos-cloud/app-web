import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { CashBox, CashBoxState } from './../models/cash-box';
import { Config } from './../app.config';
import { UserService } from './user.service';

@Injectable()
export class CashBoxService {

  constructor(
    public _http: Http,
    public _userService: UserService
  ) { }

  getCortizacion() {
		return this._http.get('http://ws.geeklab.com.ar/dolar/get-dolar-json.php').map(res => res.json());
	}

  getOpenCashBox (employeeId: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});

		let query: string = 'where="state":"'+CashBoxState.Open+'"';
		return this._http.get(Config.apiURL + 'cash-boxes/' + query, { headers: headers }).map (res => res.json());
	}

  getLastCashBox () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'cash-boxes/sort="code":-1&limit=1', { headers: headers }).map (res => res.json());
	}

  getCashBox (id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "cash-box/"+id, { headers: headers }).map (res => res.json());
	}

  getCashBoxes () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "cash-boxes", { headers: headers }).map (res => res.json());
	}

  saveCashBox (cashBox: CashBox) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.post(Config.apiURL + "cash-box", cashBox, { headers: headers }).map (res => res.json());
	}

  deleteCashBox (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.delete(Config.apiURL + "cash-box/"+id, { headers: headers }).map (res => res.json());
  }

  updateCashBox (cashBox: CashBox){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.put(Config.apiURL + "cash-box/"+cashBox._id, cashBox, { headers: headers }).map (res => res.json());
	}

	getClosingCashBox(id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "get-closing-cash-box/" + id, { headers: headers }).map(res => res.json());
	}
}
