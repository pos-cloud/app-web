import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Print } from './../models/print';

@Injectable()
export class PrintService {
  
  public url: string;

  constructor(public _http: Http) { 
    this.url = 'http://192.168.0.16:3000/api/';
  }

  toPrintBill (print: Print) {
    return this._http.post(this.url+'to-print',print).map (res => res.json());
  }

   toPrintCharge (print: Print) {
    return this._http.post(this.url+'to-print',print).map (res => res.json());
  }

  toPrint(print: Print) {
    let headers = new Headers();
    headers.append('Content-Type',
     'application/x-www-form-urlencoded');
    return this._http.post('http://localhost:3030/api-pos-resto/libs/printer/pi.php',print.content, {
      headers : headers
    }).map (res => res.json());
  }
}