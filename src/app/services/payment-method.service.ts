import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { PaymentMethod } from './../models/payment-method';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class PaymentMethodService {

  constructor(
    public _http: Http,
    public _authService: AuthService
  ) { }

  getLastPaymentMethod () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + 'payment-methods/sort="name":-1&limit=1', { headers: headers }).map (res => res.json());
  }

  getPaymentMethod (id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "payment-method/"+id, { headers: headers }).map (res => res.json());
  }

  getPaymentMethods (query?: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		if(query) {
			return this._http.get(Config.apiURL + 'payment-methods/' + query, { headers: headers }).map (res => res.json());
		} else {
			return this._http.get(Config.apiURL + "payment-methods", { headers: headers }).map (res => res.json());
		}
  }

  savePaymentMethod (paymentMethod : PaymentMethod) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.post(Config.apiURL + "payment-method",paymentMethod, { headers: headers }).map (res => res.json());
  }
  
  deletePaymentMethod (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.delete(Config.apiURL + "payment-method/"+id, { headers: headers }).map (res => res.json());
  }

  updatePaymentMethod (paymentMethod: PaymentMethod){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.put(Config.apiURL + "payment-method/"+paymentMethod._id, paymentMethod, { headers: headers }).map (res => res.json());
  }

	getSalesByPaymentMethod(query: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "sales-by-payment-method/" + query, { headers: headers }).map(res => res.json());
	}
}