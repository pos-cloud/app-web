import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { ArticleStock } from './../models/article-stock';
import { Article } from './../models/article';
import { Config } from './../app.config';
import { UserService } from './user.service';

@Injectable()
export class ArticleStockService {

	constructor(
    public _http: Http,
    public _userService: UserService
  ) { }

	getLastArticleStock() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'article-stocks/sort="code":-1&limit=1', { headers: headers }).map(res => res.json());
	}

	getArticleStock(id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "article-stock/" + id, { headers: headers }).map(res => res.json());
	}

	getArticleStocks() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "article-stocks", { headers: headers }).map(res => res.json());
	}

	getStockByArticle(articleId: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'article-stocks/where="article": "' + articleId +  '"', { headers: headers }).map(res => res.json());
	}

	saveArticleStock(articleStock: ArticleStock) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.post(Config.apiURL + "article-stock", articleStock, { headers: headers }).map(res => res.json());
	}

	deleteArticleStock(id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.delete(Config.apiURL + "article-stock/" + id, { headers: headers }).map(res => res.json());
	}

	updateArticleStock(articleStock: ArticleStock) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.put(Config.apiURL + "article-stock/" + articleStock._id, articleStock, { headers: headers }).map(res => res.json());
	}

	updateRealStock(article: Article, amount: number, transactionType: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.put(Config.apiURL + 'amount-stock-by-article/' + article._id, '{"amount":' + amount + ', "transactionType":"' + transactionType + '"}', { headers: headers }).map(res => res.json());
	}
}
