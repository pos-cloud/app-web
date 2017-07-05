import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Printer } from './../models/printer';

@Injectable()
export class PrinterService {
  
  public url: string;

  constructor(public _http: Http) { 
    this.url = 'http://localhost:3000/api/';
  }

  getLastPrinter () {
    return this._http.get(this.url+'printers/sort="_id":-1&limit=1').map (res => res.json());
  }

  getPrinter (id) {
    return this._http.get(this.url+"printer/"+id).map (res => res.json());
  }

  getPrinters () {
    return this._http.get(this.url+"printers").map (res => res.json());
  }

  savePrinter (printer : Printer) {
    return this._http.post(this.url+"printer",printer).map (res => res.json());
  }
  
  deletePrinter (id: string) {
    return this._http.delete(this.url+"printer/"+id).map (res => res.json());
  }

  updatePrinter (printer: Printer){
    return this._http.put(this.url+"printer/"+printer._id, printer).map (res => res.json());
  }
}