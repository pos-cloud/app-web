import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { PaymentMethod } from './../models/payment-method';
import { Config } from './../app.config';

@Injectable()
export class PaymentMethodService {

  constructor(public _http: Http) { }

  getLastPaymentMethod () {
    return this._http.get(Config.apiURL + 'payment-methods/sort="name":-1&limit=1').map (res => res.json());
  }

  getPaymentMethod (id) {
    return this._http.get(Config.apiURL + "payment-method/"+id).map (res => res.json());
  }

  getPaymentMethods () {
    return this._http.get(Config.apiURL + "payment-methods").map (res => res.json());
  }

  savePaymentMethod (paymentMethod : PaymentMethod) {
    return this._http.post(Config.apiURL + "payment-method",paymentMethod).map (res => res.json());
  }
  
  deletePaymentMethod (id: string) {
    return this._http.delete(Config.apiURL + "payment-method/"+id).map (res => res.json());
  }

  updatePaymentMethod (paymentMethod: PaymentMethod){
    return this._http.put(Config.apiURL + "payment-method/"+paymentMethod._id, paymentMethod).map (res => res.json());
  }
}