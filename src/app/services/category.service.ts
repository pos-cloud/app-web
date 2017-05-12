import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Category } from './../models/category';

@Injectable()
export class CategoryService {
  
  private url: string;

  constructor(private _http: Http) { 
    this.url = 'http://localhost:3000/api/';
  }

  getLastCategory () {
    return this._http.get(this.url+'categories/sort="code":-1&limit=1').map (res => res.json());
  }

  getCategory (id) {
    return this._http.get(this.url+"category/"+id).map (res => res.json());
  }

  getCategories () {
    return this._http.get(this.url+"categories").map (res => res.json());
  }

  saveCategory (category : Category) {
    return this._http.post(this.url+"category",category).map (res => res.json());
  }
  
  deleteCategory (id: string) {
    return this._http.delete(this.url+"category/"+id).map (res => res.json());
  }

  updateCategory (category: Category){
    return this._http.put(this.url+"category/"+category._id, category).map (res => res.json());
  }
}
