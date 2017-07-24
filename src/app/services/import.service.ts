import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ImportService {
  
  public url: string;

  constructor(public _http: Http) { 
    this.url = 'http://localhost:3000/api/';
  }

  import() {
		return this._http.get(this.url+'import').map (res => res.json());
	}
}
