import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { empty } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Printer } from './../models/printer';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class PrinterService {

  constructor(
    public _http: Http,
    public _authService: AuthService
  ) { }

  getLastPrinter () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + 'printers/sort="_id":-1&limit=1', { headers: headers }).map (res => res.json());
  }

  getPrinter (id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "printer/"+id, { headers: headers }).map (res => res.json());
  }

  getPrinters () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "printers", { headers: headers }).map (res => res.json());
  }

  savePrinter (printer : Printer) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.post(Config.apiURL + "printer",printer, { headers: headers }).map (res => res.json());
  }
  
  deletePrinter (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.delete(Config.apiURL + "printer/"+id, { headers: headers }).map (res => res.json());
  }

  updatePrinter (printer: Printer){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.put(Config.apiURL + "printer/"+printer._id, printer, { headers: headers }).map (res => res.json());
  }
}