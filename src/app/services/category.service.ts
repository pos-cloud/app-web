import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Category } from './../models/category';
import { Config } from './../app.config';

@Injectable()
export class CategoryService {

  constructor(public _http: Http) { }

  getLastCategory () {
    return this._http.get(Config.apiURL + 'categories/sort="code":-1&limit=1').map (res => res.json());
  }

  getCategory (id) {
    return this._http.get(Config.apiURL + "category/"+id).map (res => res.json());
  }

  getCategories () {
    return this._http.get(Config.apiURL + "categories").map (res => res.json());
  }

  saveCategory (category : Category) {
    return this._http.post(Config.apiURL + "category",category).map (res => res.json());
  }
  
  deleteCategory (id: string) {
    return this._http.delete(Config.apiURL + "category/"+id).map (res => res.json());
  }

  updateCategory (category: Category){
    return this._http.put(Config.apiURL + "category/"+category._id, category).map (res => res.json());
  }
}
