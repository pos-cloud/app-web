import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { of } from "rxjs"; import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";



import { Resource } from './../models/resource';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class ResourceService {

    public routeParams: any;

    constructor(
        private http: HttpClient,
        private _authService: AuthService

    ) {
    }


    public getResources(
        project: {},
        match: {},
        sort: {},
        group: {},
        limit: number = 0,
        skip: number = 0
    ): Observable<any> {

        const URL = `${Config.apiURL}resources`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        const params = new HttpParams()
            .set('project', JSON.stringify(project))
            .set('match', JSON.stringify(match))
            .set('sort', JSON.stringify(sort))
            .set('group', JSON.stringify(group))
            .set('limit', limit.toString())
            .set('skip', skip.toString());

        return this.http.get(URL, {
            headers: headers,
            params: params
        }).pipe(
            map(res => {
                return res;
            }),
            catchError((err) => {
                return of(err);
            })
        );
    }

    public addResource(resource: Resource): Observable<any> {

        const URL = `${Config.apiURL}resource`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        return this.http.post(URL, resource, {
            headers: headers
        }).pipe(
            map(res => {
                return res;
            }),
            catchError((err) => {
                return of(err);
            })
        );
    }

    public updateResource(resource: Resource): Observable<any> {

        const URL = `${Config.apiURL}resource`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        const params = new HttpParams()
            .set('id', resource._id);

        return this.http.put(URL, resource, {
            headers: headers,
            params: params
        }).pipe(
            map(res => {
                return res;
            }),
            catchError((err) => {
                return of(err);
            })
        );
    }

    public getResource(_id: string): Observable<any> {

        const URL = `${Config.apiURL}resource`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        const params = new HttpParams()
            .set('id', _id);

        return this.http.get(URL, {
            headers: headers,
            params: params
        }).pipe(
            map(res => {
                return res;
            }),
            catchError((err) => {
                return of(err);
            })
        );
    }

    public deleteResource(resource: Resource): Observable<any> {

        const URL = `${Config.apiURL}resource`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        const params = new HttpParams()
            .set('id', resource._id);

        return this.http.delete(URL, {
            headers: headers,
            params: params
        }).pipe(
            map(res => {
                return res;
            }),
            catchError((err) => {
                return of(err);
            })
        );
    }

    public makeFileRequest(file: File) {

        let xhr: XMLHttpRequest = new XMLHttpRequest();
        xhr.open('POST', Config.apiURL + 'upload-file/', true);
        xhr.setRequestHeader('Authorization', this._authService.getToken());

        return new Promise((resolve, reject) => {
            let formData: any = new FormData();

            formData.append('image', file, file.name);


            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        resolve(JSON.parse(xhr.response));
                    } else {
                        reject(xhr.response);
                    }
                }
            }

            xhr.send(formData);
        });
    }
}