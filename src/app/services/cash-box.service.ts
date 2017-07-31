import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { CashBox, CashBoxState } from './../models/cash-box';
import { Config } from './../app.config';

@Injectable()
export class CashBoxService {

  constructor(public _http: Http) { }

  getOpenCashBox () {
		return this._http.get(Config.apiURL + 'cash-boxes/where="state":"'+CashBoxState.Open+'"').map (res => res.json());
	}

  getLastCashBox () {
		return this._http.get(Config.apiURL + 'cash-boxes/sort="code":-1&limit=1').map (res => res.json());
	}

  getCashBox (id) {
		return this._http.get(Config.apiURL + "cash-box/"+id).map (res => res.json());
	}

  getCashBoxes () {
		return this._http.get(Config.apiURL + "cash-boxes").map (res => res.json());
	}

  saveCashBox (cashBox: CashBox) {
		return this._http.post(Config.apiURL + "cash-box", cashBox).map (res => res.json());
	}

  deleteCashBox (id: string) {
    return this._http.delete(Config.apiURL + "cash-box/"+id).map (res => res.json());
  }

  updateCashBox (id: string, cashBox: CashBox){
    return this._http.put(Config.apiURL + "cash-box/"+id, cashBox).map (res => res.json());
  }
}