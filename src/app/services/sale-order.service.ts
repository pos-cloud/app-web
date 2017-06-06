import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { SaleOrder, SaleOrderState } from './../models/sale-order';

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

  updateSaleOrder (saleOrder: SaleOrder){
    return this._http.put(this.url+"sale-order/"+saleOrder._id, saleOrder).map (res => res.json());
  }

  getOpenSaleOrder (tableId) {
		return this._http.get(this.url+'sale-orders/where="table":"'+tableId+'","state":"'+SaleOrderState.Open+'"&limit=1').map (res => res.json());
	}

  getSaleOrdersByWaiter (waiterId: string, date: string) {
		return this._http.get(this.url+'sale-orders/'+waiterId+'/'+date).map (res => res.json());
	}
  
  getLastSaleOrderByOrigen (origin: number) {
		return this._http.get(this.url+'sale-orders/where="origin":"'+origin+'"&sort="number":-1&limit=1').map (res => res.json());
	}
}
