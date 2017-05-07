import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Table } from './../models/table';

@Injectable()
export class TableService {

  private url: string;

  constructor(private _http: Http) {
    this.url = 'http://localhost:3000/api/';
  }

  getTable (id: string) {
		return this._http.get(this.url+"table/"+id).map (res => res.json());
	}

  getTables () {
		return this._http.get(this.url+"tables").map (res => res.json());
	}

  saveTable (table: Table) {
		return this._http.post(this.url+"table",table).map (res => res.json());
	}

  deleteTable (id: string) {
    return this._http.delete(this.url+"table/"+id).map (res => res.json());
  }

  updateTable (table: Table){
    return this._http.put(this.url+"table/"+table._id, table).map (res => res.json());
  }
  
  getLastTable () {
		return this._http.get(this.url+"last-table").map (res => res.json());
	}
}
