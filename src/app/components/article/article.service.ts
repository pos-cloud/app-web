import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Config } from "app/app.config";
import { Variant } from "app/components/variant/variant";
import { environment } from "environments/environment";
import { of } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { AuthService } from "../login/auth.service";
import { ModelService } from "../model/model.service";

import { Article } from "./article";
import { PriceType } from "../transaction-type/transaction-type";

@Injectable()
export class ArticleService extends ModelService {
  constructor(public _http: HttpClient, public _authService: AuthService) {
    super(
      `articles`, // PATH
      _http,
      _authService
    );
  }

  public getArticle(_id: string): Observable<any> {
    const URL = `${Config.apiURL}article`;

    const headers = new HttpHeaders()
      .set("Content-Type", "application/json")
      .set("Authorization", this._authService.getToken());

    const params = new HttpParams().set("id", _id);

    return this._http
      .get(URL, {
        headers: headers,
        params: params,
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

  public getArticles(query?: string): Observable<any> {
    const URL = `${Config.apiURL}articles`;

    const headers = new HttpHeaders()
      .set("Content-Type", "application/json")
      .set("Authorization", this._authService.getToken());

    const params = new HttpParams().set("query", query);

    return this._http
      .get(URL, {
        headers: headers,
        params: params,
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

  public getLasCode(): Observable<any>{
    const URL = `${Config.apiV8URL}articles/last-code`;

    const headers = new HttpHeaders()
      .set("Content-Type", "application/json")
      .set("Authorization", this._authService.getToken());

    return this._http
      .get(URL, {
        headers: headers,
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

  public getArticlesV2(
    project: {},
    match: {},
    sort: {},
    group: {},
    limit: number = 0,
    skip: number = 0
  ): Observable<any> {
    const URL = `${Config.apiURL}v2/articles`;

    const headers = new HttpHeaders()
      .set("Content-Type", "application/json")
      .set("Authorization", this._authService.getToken());

    const params = new HttpParams()
      .set("project", JSON.stringify(project))
      .set("match", JSON.stringify(match))
      .set("sort", JSON.stringify(sort))
      .set("group", JSON.stringify(group))
      .set("limit", limit.toString())
      .set("skip", skip.toString());

    return this._http
      .get(URL, {
        headers: headers,
        params: params,
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

  public getHArticles(
    project: {},
    match: {},
    sort: {},
    group: {},
    limit: number = 0,
    skip: number = 0
  ): Observable<any> {
    const URL = `${Config.apiURL}v2/histories`;

    const headers = new HttpHeaders()
      .set("Content-Type", "application/json")
      .set("Authorization", this._authService.getToken());

    const params = new HttpParams()
      .set("project", JSON.stringify(project))
      .set("match", JSON.stringify(match))
      .set("sort", JSON.stringify(sort))
      .set("group", JSON.stringify(group))
      .set("limit", limit.toString())
      .set("skip", skip.toString());

    return this._http
      .get(URL, {
        headers: headers,
        params: params,
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

  public saveArticle(article: Article): Observable<any> {
    const URL = `${Config.apiV8URL}articles`;

    const headers = new HttpHeaders()
      .set("Content-Type", "application/json")
      .set("Authorization", this._authService.getToken());

    return this._http
      .post(
        URL,article,
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

  public updateArticle(article: Article): Observable<any> {
    const URL = `${Config.apiV8URL}articles`;

    const headers = new HttpHeaders()
      .set("Content-Type", "application/json")
      .set("Authorization", this._authService.getToken());

    return this._http
      .put(`${URL}/${article._id}`, article, {
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

  public updatePrices(articlesCode: string[], field: PriceType, decimal: number, percentage: number): Observable<any> {
    const URL = `${Config.apiV8URL}articles/update-prices`;

    const headers = new HttpHeaders()
      .set("Content-Type", "application/json")
      .set("Authorization", this._authService.getToken());

    return this._http
    .post(
      URL,
      { articlesCode, field, decimal, percentage },
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

  public makeFileRequest(origin: string, files: Array<File>) {
    let xhr: XMLHttpRequest = new XMLHttpRequest();

    xhr.open(
      "POST",
      `${environment.apiStorage}/upload`,
      true
    );
    xhr.setRequestHeader("Authorization", this._authService.getToken());

    return new Promise((resolve, reject) => {
      let formData: any = new FormData();

      if (files && files.length > 0) {
        for (let i: number = 0; i < files.length; i++) {
          formData.append("file", files[i], files[i].name);
        }
      }

      formData.append('origin', origin)

      xhr.onreadystatechange = function () {
        console.log(xhr);
        if (xhr.readyState == 4) {
          if (xhr.status == 201) {
            resolve(xhr.response);
          } else {
            reject(xhr.response);
          }
        }
      };

      xhr.send(formData);
    });
  }

  public makeFileRequestArray(files: Array<File>) {
    let xhr: XMLHttpRequest = new XMLHttpRequest();

    xhr.open("POST", Config.apiURL + "upload-image-article/", true);
    xhr.setRequestHeader("Authorization", this._authService.getToken());

    return new Promise((resolve, reject) => {
      let formData: any = new FormData();

      if (files && files.length > 0) {
        for (let i: number = 0; i < files.length; i++) {
          formData.append("image", files[i], files[i].name);
        }
      }

      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            resolve(JSON.parse(xhr.response));
          } else {
            reject(xhr.response);
          }
        }
      };

      xhr.send(formData);
    });
  }

  public deleteImage(picture: string): Observable<any> {
    const URL = `${Config.apiURL}delete-image-article`;

    const headers = new HttpHeaders()
      .set("Content-Type", "application/json")
      .set("Authorization", this._authService.getToken());

    const params = new HttpParams().set("picture", picture);

    return this._http
      .delete(URL, {
        headers: headers,
        params: params,
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

  public deleteImageGoogle(origin: string): Observable<any> {
    const URL = `${environment.apiStorage}/upload`;

    const headers = new HttpHeaders()
      .set("Content-Type", "application/json")
      .set("Authorization", this._authService.getToken());

    return this._http
      .delete(URL, {
        headers: headers,
        body: {
          origin: origin
        }
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

  public getPicture(picture: string): Observable<any> {
    const URL = `${Config.apiURL}get-image-base64-article`;

    const params = new HttpParams().set("picture", picture);

    const headers = new HttpHeaders()
      .set("Content-Type", "application/json")
      .set("Authorization", this._authService.getToken());

    return this._http
      .get(URL, {
        headers: headers,
        params: params,
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

  public getAllArticlesTiendaNube(): Observable<any> {
    const URL = `${environment.apiv2}/articles/articles-tiendanube`;

    const headers = new HttpHeaders()
      .set("Content-Type", "application/json")
      .set("Authorization", this._authService.getToken());

    return this._http
      .get(URL,
        {
          headers: headers,
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

  public updateArticleTiendaNube(id: string): Observable<any> {
    const URL = `${environment.apiTiendaNube}/products/${id}`;

    const headers = new HttpHeaders()
    .set("Content-Type", "application/json")
    .set("Authorization", this._authService.getToken());
   
    return this._http
      .patch(URL, {}, { headers: headers })
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((err) => {
          return of(err);
        })
      );
  }

  public updateArticlesTiendaNube(tiendaNubeIds: string[]): Observable<any> {
    const URL = `${environment.apiTiendaNube}/products/massive`;

    const headers = new HttpHeaders()
    .set("Content-Type", "application/json")
    .set("Authorization", this._authService.getToken());
   
    return this._http
      .put(URL, 
        { tiendaNubeIds: tiendaNubeIds }, 
        { headers: headers })
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((err) => {
          return of(err);
        })
      );
  }

  public deleteArticleTiendaNube(tiendaNubeId: string): Observable<any> {
    const URL = `${environment.apiTiendaNube}/products/${tiendaNubeId}`;

    const headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    .set('Authorization', this._authService.getToken());

  const params = new HttpParams().set('tiendaNubeId', tiendaNubeId);

  return this._http
    .delete(URL, { headers: headers })
    .pipe(
      map((res) => {
        return res;
      }),
      catchError((err) => {
        return of(err);
      }),
    );
  }
}

