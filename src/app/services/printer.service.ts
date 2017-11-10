import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Printer } from './../models/printer';
import { Config } from './../app.config';
import { UserService } from './user.service';

@Injectable()
export class PrinterService {

  constructor(
    public _http: Http,
    public _userService: UserService
  ) { }

  getLastPrinter () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.get(Config.apiURL + 'printers/sort="_id":-1&limit=1', { headers: headers }).map (res => res.json());
  }

  getPrinter (id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.get(Config.apiURL + "printer/"+id, { headers: headers }).map (res => res.json());
  }

  getPrinters () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.get(Config.apiURL + "printers", { headers: headers }).map (res => res.json());
  }

  savePrinter (printer : Printer) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.post(Config.apiURL + "printer",printer, { headers: headers }).map (res => res.json());
  }
  
  deletePrinter (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.delete(Config.apiURL + "printer/"+id, { headers: headers }).map (res => res.json());
  }

  updatePrinter (printer: Printer){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.put(Config.apiURL + "printer/"+printer._id, printer, { headers: headers }).map (res => res.json());
  }
}