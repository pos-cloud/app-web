import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { UseOfCFDI } from '@types';
import { AuthService } from 'app/core/services/auth.service';
import { ModelService } from 'app/core/services/model.service';
import { Config } from '../../app.config';

@Injectable({
  providedIn: 'root',
})
export class UseOfCFDIService extends ModelService {
  constructor(public _http: HttpClient, public _authService: AuthService) {
    super(
      `uses-of-cdfi`, // PATH
      _http,
      _authService
    );
  }
}
