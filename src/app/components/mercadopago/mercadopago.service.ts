import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthService } from '../login/auth.service';
import { ModelService } from '../model/model.service';

@Injectable()
export class MercadopagoService extends ModelService {

  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {
    super(
      `mercadopago`, // PATH
      _http,
      _authService
    );
  }
}
