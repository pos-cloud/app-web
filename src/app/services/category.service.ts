import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { Category } from './../models/category';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class CategoryService {

	constructor(
		public _http: Http,
		public _authService: AuthService
	) { }

	getLastCategory () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + 'categories/sort="order":-1&limit=1', { headers: headers }).map (res => res.json());
	}

	getCategory (id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "category/"+id, { headers: headers }).map (res => res.json());
	}

	getCategories (query?: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		
		if(query) {
			return this._http.get(Config.apiURL + 'categories/' + query, { headers: headers }).map (res => res.json());
		} else {
			return this._http.get(Config.apiURL + "categories", { headers: headers }).map (res => res.json());
		}
	}

	saveCategory (category : Category) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.post(Config.apiURL + "category",category, { headers: headers }).map (res => res.json());
	}

	deleteCategory (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.delete(Config.apiURL + "category/"+id, { headers: headers }).map (res => res.json());
	}

	updateCategory (category: Category){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.put(Config.apiURL + "category/"+category._id, category, { headers: headers }).map (res => res.json());
	}

	public makeFileRequest(idCategory: String, files: Array<File>) {

		let xhr: XMLHttpRequest = new XMLHttpRequest();
		xhr.open('POST', Config.apiURL + 'upload-image-category/' + idCategory, true);
		xhr.setRequestHeader('Authorization', this._authService.getToken());

		return new Promise((resolve, reject) => {
			let formData: any = new FormData();

			if(files && files.length > 0) {
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

  getSalesByCategory(query: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._authService.getToken()
    });
    return this._http.get(Config.apiURL + "sales-by-category/" + query, { headers: headers }).map(res => res.json());
  }
}
