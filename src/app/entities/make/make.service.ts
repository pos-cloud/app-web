import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AuthService } from 'app/components/login/auth.service';
import { ModelService } from 'app/components/model/model.service';

@Injectable()
export class MakeService extends ModelService {
  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {
    super(
      `makes`, // PATH
      _http,
      _authService
    );
  }
}
