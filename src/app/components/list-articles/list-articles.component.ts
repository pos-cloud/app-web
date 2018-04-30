import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { Article } from './../../models/article';
import { Category } from './../../models/category';

import { ArticleService } from './../../services/article.service';

import { AddArticleComponent } from './../../components/add-article/add-article.component';
import { UpdateArticleComponent } from './../../components/update-article/update-article.component';
import { DeleteArticleComponent } from './../../components/delete-article/delete-article.component';
import { ImportComponent } from './../../components/import/import.component';

import { Config } from './../../app.config';

@Component({
  selector: 'app-list-articles',
  templateUrl: './list-articles.component.html',
  styleUrls: ['./list-articles.component.css'],
  providers: [NgbAlertConfig]
})

export class ListArticlesComponent implements OnInit {

  public articles: Article[] = new Array();
  public areArticlesEmpty: boolean = true;
  public alertMessage: string = "";
  public userType: string;
  public orderTerm: string[] = ['code'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Output() eventAddItem: EventEmitter<Article> = new EventEmitter<Article>();
  @Input() areArticlesVisible: boolean = true;
  @Input() filterCategorySelected: Category;
  @Input() filterArticle: string;
  public apiURL = Config.apiURL;
  public itemsPerPage = 10;
  public totalItems = 0;

  constructor(
    public _articleService: ArticleService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) {
    if (this.filterCategorySelected === undefined) {
      this.filterCategorySelected = new Category();
      this.filterCategorySelected.description = "";
    }

    if (this.filterArticle === undefined) {
      this.filterArticle = "";
    }
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getArticles();
  }

  public getArticles(): void {

    this.loading = true;

    this._articleService.getArticles().subscribe(
      result => {
        if (!result.articles) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.loading = false;
          this.articles = null;
          this.areArticlesEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.articles = result.articles;
          this.totalItems = this.articles.length;
          this.areArticlesEmpty = false;
        }
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public orderBy(term: string, property?: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-" + term;
    } else {
      this.orderTerm[0] = term;
    }
    this.propertyTerm = property;
  }

  public refresh(): void {
    this.getArticles();
  }

  public openModal(op: string, article: Article): void {

    let modalRef;
    switch (op) {
      case 'view':
        modalRef = this._modalService.open(UpdateArticleComponent, { size: 'lg' });
        modalRef.componentInstance.article = article;
        modalRef.componentInstance.readonly = true;
        break;
      case 'add':
        modalRef = this._modalService.open(AddArticleComponent, { size: 'lg' }).result.then((result) => {
          this.getArticles();
        }, (reason) => {
          this.getArticles();
        });
        break;
      case 'update':
        modalRef = this._modalService.open(UpdateArticleComponent, { size: 'lg' });
        modalRef.componentInstance.article = article;
        modalRef.componentInstance.readonly = false;
        modalRef.result.then((result) => {
          if (result === 'save_close') {
            this.getArticles();
          }
        }, (reason) => {

        });
        break;
      case 'delete':
        modalRef = this._modalService.open(DeleteArticleComponent, { size: 'lg' });
        modalRef.componentInstance.article = article;
        modalRef.result.then((result) => {
          if (result === 'delete_close') {
            this.getArticles();
          }
        }, (reason) => {

        });
        break;
      case 'import':
        modalRef = this._modalService.open(ImportComponent, { size: 'lg' });
        let model: any = new Article();
        model.model = "article";
        model.primaryKey = "code";
        model.relations = new Array();
        model.relations.push("make_relation_description");
        model.relations.push("category_relation_description");
        modalRef.componentInstance.model = model;
        modalRef.result.then((result) => {
          if (result === 'import_close') {
            this.getArticles();
          }
        }, (reason) => {

        });
        break;
      default: ;
    }
  };

  public addItem(articleSelected) {
    this.eventAddItem.emit(articleSelected);
  }

  public filterItem(articles: Article[]) {
    if(articles != undefined && articles.length === 1 && this.articles.length >= 2) {
      this.eventAddItem.emit(articles[0]);
    }
    this.filterArticle = "";
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = "";
  }
}