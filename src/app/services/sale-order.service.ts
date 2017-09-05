import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { SaleOrder, SaleOrderState } from './../models/sale-order';
import { Config } from './../app.config';

@Injectable()
export class SaleOrderService {

  constructor(public _http: Http) { }

  getSaleOrder (id) {
		return this._http.get(Config.apiURL + "sale-order/"+id).map (res => res.json());
	}

  getSaleOrders () {
		return this._http.get(Config.apiURL + "sale-orders").map (res => res.json());
	}

  saveSaleOrder (saleOrder: SaleOrder) {
		return this._http.post(Config.apiURL + "sale-order",saleOrder).map (res => res.json());
	}
    
  deleteSaleOrder (id: string) {
    return this._http.delete(Config.apiURL + "sale-order/"+id).map (res => res.json());
  }

  updateSaleOrder (saleOrder: SaleOrder){
    return this._http.put(Config.apiURL + "sale-order/"+saleOrder._id, saleOrder).map (res => res.json());
  }

	getOpenSaleOrderByTable (tableId) {
		return this._http.get(Config.apiURL + 'sale-orders/where="table":"'+tableId+'","state":"'+SaleOrderState.Open+'"&limit=1').map (res => res.json());
	}

	getOpenSaleOrder() {
		return this._http.get(Config.apiURL + 'sale-orders/where="state":"' + SaleOrderState.Open + '"').map(res => res.json());
	}

  getSaleOrdersByEmployee (employeeId: string, date: string) {
		return this._http.get(Config.apiURL + 'sale-orders/'+employeeId+'/'+date).map (res => res.json());
	}

	getLastSaleOrder() {
		return this._http.get(Config.apiURL + 'sale-orders/sort="number":-1&limit=1').map(res => res.json());
	}
  
  getLastSaleOrderByOrigen (origin: number) {
		return this._http.get(Config.apiURL + 'sale-orders/where="origin":"'+origin+'"&sort="number":-1&limit=1').map (res => res.json());
	}
  
  getLastSaleOrderByTable (tableId: string) {
		return this._http.get(Config.apiURL + 'sale-orders/where="table":"'+tableId+'"&sort="number":-1&limit=1').map (res => res.json());
	}
}
