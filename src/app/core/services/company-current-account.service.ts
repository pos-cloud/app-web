import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AuthService } from './auth.service';
import { ModelService } from './model.service';

@Injectable({
  providedIn: 'root',
})
export class CompanyCurrentAccountService extends ModelService {
  constructor(public _http: HttpClient, public _authService: AuthService) {
    super(
      `company-current-accounts`, // PATH
      _http,
      _authService
    );
  }
}
