import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { of } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Config } from '../../app.config';
import { Branch } from './branch';
import { AuthService } from '../login/auth.service';

@Injectable()
export class BranchService {

    constructor(
        private _http: HttpClient,
        private _authService: AuthService
    ) { }

    public getBranch(_id: string): Observable<any> {

        const URL = `${Config.apiURL}branch`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        const params = new HttpParams()
            .set('id', _id);

        return this._http.get(URL, {
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

    public getBranches(
        project: {},
        match: {},
        sort: {},
        group: {},
        limit: number = 0,
        skip: number = 0
    ): Observable<any> {

        const URL = `${Config.apiURL}branches`;

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

        return this._http.get(URL, {
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

    public saveBranch(branch: Branch): Observable<any> {

        const URL = `${Config.apiURL}branch`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        return this._http.post(URL, branch, {
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

    public updateBranch(branch: Branch): Observable<any> {

        const URL = `${Config.apiURL}branch`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken())

        const params = new HttpParams()
            .set('id', branch._id);

        return this._http.put(URL, branch, {
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

    public deleteBranch(_id: string): Observable<any> {

        const URL = `${Config.apiURL}branch`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        const params = new HttpParams()
            .set('id', _id);

        return this._http.delete(URL, {
            headers: headers,
            params: params
        }).pipe(
            map(res => {
                return res;
            }),
        );
    }

    public makeFileRequest(branch, files: Array<File>) {

        let xhr: XMLHttpRequest = new XMLHttpRequest();
        xhr.open('POST', Config.apiURL + 'upload-image-branch/' + branch._id, true);
        xhr.setRequestHeader('Authorization', this._authService.getToken());

        return new Promise((resolve, reject) => {
            let formData: any = new FormData();

            if (files && files.length > 0) {
                for (let i: number = 0; i < files.length; i++) {
                    formData.append('image', files[i], files[i].name);
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
            }

            xhr.send(formData);
        });
    }

    public updloadFile(files: Array<File>) {

        let xhr: XMLHttpRequest = new XMLHttpRequest();
        xhr.open('POST', Config.apiURL + 'upload-crt', true);
        xhr.setRequestHeader('Authorization', this._authService.getToken());

        return new Promise((resolve, reject) => {
            let formData: any = new FormData();

            if (files && files.length > 0) {
                for (let i: number = 0; i < files.length; i++) {
                    formData.append('file', files[i], files[i].name);
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
            }

            xhr.send(formData);
        });
    }

    public deletePicture(_id: string): Observable<any> {

        const URL = `${Config.apiURL}delete-image-branch`;

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        const params = new HttpParams()
            .set('id', _id);

        return this._http.delete(URL, {
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

    public getPicture(picture: string): Observable<any> {

        const URL = `${Config.apiURL}get-image-base64-branch`;

        const params = new HttpParams()
            .set('picture', picture);

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this._authService.getToken());

        return this._http.get(URL, {
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
}
