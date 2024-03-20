import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import { ModelService } from '../model/model.service';
import { AuthService } from '../login/auth.service';
import { Observable } from "rxjs/Observable";
import { map, catchError, mergeMap } from "rxjs/operators";
import { of } from "rxjs";
import { Config } from "app/app.config";

@Injectable()
export class ApplicationService extends ModelService {

  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) {
    super(
      `applications`, // PATH
      _http,
      _authService
    );
  }

  public createWebhookTn(userId: string, authentication: string): Observable<any>{
    const URL = `${Config.apiV8URL}tienda-nube/create-webhook`;
  
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json")
  
    return this._http.post(
        URL,
        {
          userId: userId,
          event: "order/created",
          url: "https://api-tiendanube.poscloud.ar/orders/post-webhook",
          authentication: authentication
        },
        { headers: headers }
      ).pipe(
        mergeMap(() => {
          return this._http.post(
            URL,
            {
              userId: userId,
              event: "order/updated",
              url: "https://api-tiendanube.poscloud.ar/orders/post-webhook",
              authentication: authentication
            },
            { headers: headers }
          ).pipe(
            catchError((error) => {
              
              console.log(error)
              return of(error);
            })
          );
        })
      );
  }

  public getWebhookTn(userId: string, authentication: string){
    const URL = `${Config.apiV8URL}tienda-nube/get-webhook`
  
      const params = {
        userId: userId,
        authentication: authentication
      }
  
    return this._http.get(
      URL, {
        headers: {
          "Content-Type": "application/json",
        },
         params
      })
    .pipe(
      map((res) => {
        return res;
      }),
      catchError((err) => {
        return of(err);
      })
    );
  }
}