import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ModelService } from '../model/model.service';
import { AuthService } from '../login/auth.service';

@Injectable()
export class PermissionService extends ModelService {

  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {
    super(
      `permissions`, // PATH
      _http,
      _authService
    );
  }
}
