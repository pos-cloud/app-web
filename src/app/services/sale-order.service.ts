import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { SaleOrder } from './../models/sale-order';

@Injectable()
export class SaleOrderService {

  private url: string;

  constructor(private _http: Http) { 
    this.url = 'http://localhost:3000/api/';
  }

  getSaleOrder (id) {
		return this._http.get(this.url+"sale-order/"+id).map (res => res.json());
	}

  getSaleOrders () {
		return this._http.get(this.url+"sale-orders").map (res => res.json());
	}

  saveSaleOrder (saleOrder: SaleOrder) {
		return this._http.post(this.url+"sale-order",saleOrder).map (res => res.json());
	}
    
  deleteSaleOrder (id: string) {
    return this._http.delete(this.url+"sale-order/"+id).map (res => res.json());
  }

  updateSaleOrder (id: string, saleOrder: SaleOrder){
    return this._http.put(this.url+"sale-order/"+id, saleOrder).map (res => res.json());
  }
}
