import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Table } from './../models/table';
import { Config } from './../app.config';

@Injectable()
export class TableService {

  constructor(public _http: Http) { }
  
  getLastTable () {
    return this._http.get(Config.apiURL + 'tables/sort="description":-1&limit=1').map (res => res.json());
  }

  getTable (id: string) {
		return this._http.get(Config.apiURL + "table/"+id).map (res => res.json());
	}

  getTables () {
		return this._http.get(Config.apiURL + "tables").map (res => res.json());
	}

  getTablesByRoom (roomId: string) {
		return this._http.get(Config.apiURL + 'tables/where="room":"'+roomId+'"&sort="description":1').map (res => res.json());
	}

  saveTable (table: Table) {
		return this._http.post(Config.apiURL + "table",table).map (res => res.json());
	}

  deleteTable (id: string) {
    return this._http.delete(Config.apiURL + "table/"+id).map (res => res.json());
  }

  updateTable (table: Table){
    return this._http.put(Config.apiURL + "table/"+table._id, table).map (res => res.json());
  }
}
