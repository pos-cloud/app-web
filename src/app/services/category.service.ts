import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Category } from './../models/category';
import { Config } from './../app.config';
import { UserService } from './user.service';

@Injectable()
export class CategoryService {

	constructor(
		public _http: Http,
		public _userService: UserService
	) { }

	getLastCategory () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.get(Config.apiURL + 'categories/sort="code":-1&limit=1', { headers: headers }).map (res => res.json());
	}

	getCategory (id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.get(Config.apiURL + "category/"+id, { headers: headers }).map (res => res.json());
	}

	getCategories () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.get(Config.apiURL + "categories", { headers: headers }).map (res => res.json());
	}

	saveCategory (category : Category) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.post(Config.apiURL + "category",category, { headers: headers }).map (res => res.json());
	}
  
	deleteCategory (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.delete(Config.apiURL + "category/"+id, { headers: headers }).map (res => res.json());
	}

	updateCategory (category: Category){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken()
		});
		return this._http.put(Config.apiURL + "category/"+category._id, category, { headers: headers }).map (res => res.json());
	}

	public makeFileRequest(idCategory: String, files: Array<File>) {
	  
		let xhr: XMLHttpRequest = new XMLHttpRequest();
		xhr.open('POST', Config.apiURL + 'upload-image-category/' + idCategory, true);
		xhr.setRequestHeader('Authorization', this._userService.getToken());

		return new Promise(function (resolve, reject) {
			let formData: any = new FormData();
			
			for (let i: number = 0; i < files.length; i++) {
				formData.append('image', files[i], files[i].name);
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
}
