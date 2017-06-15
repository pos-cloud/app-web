import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Print } from './../models/print';

@Injectable()
export class PrintService {
  
  public url: string;

  constructor(public _http: Http) { 
    this.url = 'http://localhost:3000/api/';
  }

  toPrintBill (print: Print) {
    return this._http.post(this.url+'to-print',print).map (res => res.json());
  }
}