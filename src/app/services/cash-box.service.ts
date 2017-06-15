import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { CashBox, CashBoxState } from './../models/cash-box';

@Injectable()
export class CashBoxService {

  public url: string;

  constructor(public _http: Http) {
    this.url = 'http://localhost:3000/api/';
  }

  getOpenCashBox () {
		return this._http.get(this.url+'cash-boxes/where="state":"'+CashBoxState.Open+'"').map (res => res.json());
	}

  getLastCashBox () {
		return this._http.get(this.url+'cash-boxes/sort="code":-1&limit=1').map (res => res.json());
	}

  getCashBox (id) {
		return this._http.get(this.url+"cash-box/"+id).map (res => res.json());
	}

  getCashBoxes () {
		return this._http.get(this.url+"cash-boxes").map (res => res.json());
	}

  saveCashBox (cashBox: CashBox) {
		return this._http.post(this.url+"cash-box", cashBox).map (res => res.json());
	}

  deleteCashBox (id: string) {
    return this._http.delete(this.url+"cash-box/"+id).map (res => res.json());
  }

  updateCashBox (id: string, cashBox: CashBox){
    return this._http.put(this.url+"cash-box/"+id, cashBox).map (res => res.json());
  }
}