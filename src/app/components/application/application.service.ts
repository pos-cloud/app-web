import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ModelService } from '../model/model.service';
import { AuthService } from '../login/auth.service';
import { Observable } from "rxjs/Observable";
import { map, catchError, mergeMap } from "rxjs/operators";
import { of } from "rxjs";

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

  public createWebhookTn(userId: string, authentication: string): Observable<any> {
    const URL = `https://api.tiendanube.com/v1/${userId}/webhooks`;
  
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json")
      .set("Authentication", `bearer ${authentication}`);
  
    return this._http.post(
        URL,
        {
          event: "order/created",
          url: "https://api-tiendanube.poscloud.ar/orders/post-webhook"
        },
        { headers: headers }
      ).pipe(
        mergeMap(() => {
          return this._http.post(
            URL,
            {
              event: "order/updated",
              url: "https://api-tiendanube.poscloud.ar/orders/post-webhook"
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
    const URL = `https://api.tiendanube.com/v1/${userId}/webhooks`;
  
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json")
      .set("Authentication", `bearer ${authentication}`);
  
    return this._http.get(
      URL,
      {
        headers: headers,
      }
    )
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