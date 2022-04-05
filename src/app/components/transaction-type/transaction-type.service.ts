import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ModelService } from '../model/model.service';
import { AuthService } from '../login/auth.service';
import { Observable } from "rxjs";

@Injectable()
export class TransactionTypeService extends ModelService {

    public _jsonURL = 'assets/datos/optionalAFIP.json';

    constructor(
        public _http: HttpClient,
        public _authService: AuthService

    ) {
        super(
            `transaction-types`, // PATH
            _http,
            _authService
        );
    }

    public getJSON(): Observable<any> {
        return this._http.get(this._jsonURL);
    }
}
