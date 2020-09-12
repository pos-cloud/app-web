import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ModelService } from '../model/model.service';
import { AuthService } from '../login/auth.service';

@Injectable()
export class HolidayService extends ModelService {

  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {
    super(
      `holidays`, // PATH
      _http,
      _authService
    );
  }
}
