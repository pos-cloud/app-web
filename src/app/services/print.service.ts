import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Print } from './../models/print';
import { Config } from './../app.config';

@Injectable()
export class PrintService {

  constructor(public _http: Http) { }

  toPrintBill (print: Print) {
    return this._http.post(Config.apiURL + 'to-print',print).map (res => res.json());
  }

   toPrintCharge (print: Print) {
    return this._http.post(Config.apiURL + 'to-print',print).map (res => res.json());
  }

  toPrint(print: Print) {
    let headers = new Headers();
    headers.append('Content-Type',
     'application/x-www-form-urlencoded');
    return this._http.post(Config.printURL + '/libs/printer/pi.php',print.content, {
      headers : headers
    }).map (res => res.json());
  }
}