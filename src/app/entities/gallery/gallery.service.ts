import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AuthService } from 'app/components/login/auth.service';
import { ModelService } from 'app/components/model/model.service';

@Injectable()
export class GalleryService extends ModelService {
  constructor(public _http: HttpClient, public _authService: AuthService) {
    super(
      `galleries`, // PATH
      _http,
      _authService
    );
  }
}
