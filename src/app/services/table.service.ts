import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { empty } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Table } from './../models/table';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class TableService {

  constructor(
    public _http: Http,
    public _authService: AuthService
  ) { }

  getLastTable () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + 'tables/sort="description":-1&limit=1', { headers: headers }).map (res => res.json());
  }

  getTable (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "table/"+id, { headers: headers }).map (res => res.json());
	}

  getTables () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "tables", { headers: headers }).map (res => res.json());
	}

  getTablesByRoom (roomId: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + 'tables/where="room":"'+roomId+'"&sort="description":1', { headers: headers }).map (res => res.json());
	}

  saveTable (table: Table) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.post(Config.apiURL + "table",table, { headers: headers }).map (res => res.json());
	}

  deleteTable (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.delete(Config.apiURL + "table/"+id, { headers: headers }).map (res => res.json());
  }

  updateTable (table: Table){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.put(Config.apiURL + "table/"+table._id, table, { headers: headers }).map (res => res.json());
  }
}
