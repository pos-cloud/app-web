import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from 'app/core/services/auth.service';
import { ModelService } from 'app/core/services/model.service';

@Injectable({
  providedIn: 'root',
})
export class TaxService extends ModelService {
  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {
    super(
      `taxes`, // PATH
      _http,
      _authService
    );
  }

}
