import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ModelService } from 'app/core/services/model.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TransportService extends ModelService {
  constructor(public _http: HttpClient, public _authService: AuthService) {
    super(
      `transports`, // PATH
      _http,
      _authService
    );
  }
}
