import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Article } from './../../models/article';
import { ArticleService } from './../../services/article.service';

import { Pipe, PipeTransform } from '@angular/core';
import { FilterPipe } from './../../pipes/filter.pipe';
import { OrderByPipe } from './../../pipes/order-by.pipe';


@Component({
  selector: 'app-list-articles',
  templateUrl: './list-articles.component.html',
  styleUrls: ['./list-articles.component.css']
})
export class ListArticlesComponent implements OnInit {

  private articles: Article[];
  private errorMessage;
  private location: string;
  private userType: string;

  constructor(
    private _articleService: ArticleService,
    private _router: Router
  ) { }

  ngOnInit() {
  }


  private getArticles() {  
    this._articleService.getArticles().subscribe(
        result => {

					this.articles = result.articles;
          
					if(!this.articles) {
						alert("Error al traer artículos. Error en el servidor.");
					}
				},
				error => {
					this.errorMessage = <any> error;

					if(!this.errorMessage) {
						alert("Error en la petición.");
					}
				}
      );
   }

}
