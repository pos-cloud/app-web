import { ModelService } from 'app/core/services/model.service';
import { AuthService } from './auth.service';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AccountSeatService extends ModelService {
  constructor(public _http: HttpClient, public _authService: AuthService) {
    super(
      `account-seats`, // PATH
      _http,
      _authService
    );
  }
}
