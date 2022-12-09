import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Variant } from "app/components/variant/variant";
import { environment } from "environments/environment";
import { of } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { AuthService } from "../login/auth.service";
import { ModelService } from "../model/model.service";

import { Article } from "./article";

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
    const URL = `${environment.api}/article`;

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
    const URL = `${environment.api}/articles`;

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

  public getArticlesV2(
    project: {},
    match: {},
    sort: {},
    group: {},
    limit: number = 0,
    skip: number = 0
  ): Observable<any> {
    const URL = `${environment.api}/v2/articles`;

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
    const URL = `${environment.api}/v2/histories`;

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

  public saveArticle(article: Article, variants: Variant[]): Observable<any> {
    const URL = `${environment.api}/article`;

    const headers = new HttpHeaders()
      .set("Content-Type", "application/json")
      .set("Authorization", this._authService.getToken());

    return this._http
      .post(
        URL,
        { article: article, variants: variants },
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

  public updateArticle(article: Article, variants: Variant[]): Observable<any> {
    const URL = `${environment.api}/article`;

    const headers = new HttpHeaders()
      .set("Content-Type", "application/json")
      .set("Authorization", this._authService.getToken());

    const params = new HttpParams().set("id", article._id);

    return this._http
      .put(
        URL,
        { article: article, variants: variants },
        {
          headers: headers,
          params: params,
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

  public updatePrice(query: string, decimal: string): Observable<any> {
    const URL = `${environment.api}/update-prices`;

    const headers = new HttpHeaders()
      .set("Content-Type", "application/json")
      .set("Authorization", this._authService.getToken());

    const params = new HttpParams().set("decimal", decimal);

    return this._http
      .put(URL, query, {
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

  public updatePrice2(query: string): Observable<any> {
    const URL = `${environment.api}/articles/update-prices`;

    const headers = new HttpHeaders()
      .set("Content-Type", "application/json")
      .set("Authorization", this._authService.getToken());

    return this._http
      .post(URL, query, {
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

  public makeFileRequest(idArticle: String, files: Array<File>) {
    let xhr: XMLHttpRequest = new XMLHttpRequest();

    xhr.open(
      "POST",
      environment.api + "upload-image-article/" + idArticle,
      true
    );
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

  public makeFileRequestArray(files: Array<File>) {
    let xhr: XMLHttpRequest = new XMLHttpRequest();

    xhr.open("POST", environment.api + "upload-image-article/", true);
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
    const URL = `${environment.api}/delete-image-article`;

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

  public getPicture(picture: string): Observable<any> {
    const URL = `${environment.api}/get-image-base64-article`;

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
}
