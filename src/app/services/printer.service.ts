import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Printer } from './../models/printer';
import { Config } from './../app.config';

@Injectable()
export class PrinterService {

  constructor(public _http: Http) { }

  getLastPrinter () {
    return this._http.get(Config.apiURL + 'printers/sort="_id":-1&limit=1').map (res => res.json());
  }

  getPrinter (id) {
    return this._http.get(Config.apiURL + "printer/"+id).map (res => res.json());
  }

  getPrinters () {
    return this._http.get(Config.apiURL + "printers").map (res => res.json());
  }

  savePrinter (printer : Printer) {
    return this._http.post(Config.apiURL + "printer",printer).map (res => res.json());
  }
  
  deletePrinter (id: string) {
    return this._http.delete(Config.apiURL + "printer/"+id).map (res => res.json());
  }

  updatePrinter (printer: Printer){
    return this._http.put(Config.apiURL + "printer/"+printer._id, printer).map (res => res.json());
  }
}