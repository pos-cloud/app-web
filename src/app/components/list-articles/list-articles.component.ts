import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { Article } from './../../models/article';
import { Category } from './../../models/category';
import { Config } from './../../app.config';
import { MovementOfArticle } from '../../models/movement-of-article';
import { Taxes } from './../../models/taxes';

import { ArticleService } from './../../services/article.service';

import { AddArticleComponent } from './../../components/add-article/add-article.component';
import { DeleteArticleComponent } from './../../components/delete-article/delete-article.component';
import { ImportComponent } from './../../components/import/import.component';

import { RoundNumberPipe } from './../../pipes/round-number.pipe';

@Component({
  selector: 'app-list-articles',
  templateUrl: './list-articles.component.html',
  styleUrls: ['./list-articles.component.css'],
  providers: [NgbAlertConfig, RoundNumberPipe]
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
  @Output() eventAddItem: EventEmitter<MovementOfArticle> = new EventEmitter<MovementOfArticle>();
  @Input() areArticlesVisible: boolean = true;
  @Input() filterCategorySelected: Category;
  @Input() filterArticle: string;
  public apiURL = Config.apiURL;
  public itemsPerPage = 10;
  public totalItems = 0;
  public roundNumber = new RoundNumberPipe();

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
    this.getFinalArticles();
  }

  public getFinalArticles(): void {

    this.loading = true;

    this._articleService.getFinalArticles().subscribe(
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
    this.getFinalArticles();
  }

  public openModal(op: string, article: Article): void {

    let modalRef;
    switch (op) {
      case 'view':
        modalRef = this._modalService.open(AddArticleComponent, { size: 'lg' });
        modalRef.componentInstance.article = article;
        modalRef.componentInstance.operation = "view";
        break;
      case 'add':
        modalRef = this._modalService.open(AddArticleComponent, { size: 'lg' });
        modalRef.componentInstance.operation = "add";
        modalRef.result.then((result) => {
          this.getFinalArticles();
        }, (reason) => {
          this.getFinalArticles();
        });
        break;
      case 'update':
        modalRef = this._modalService.open(AddArticleComponent, { size: 'lg' });
        modalRef.componentInstance.article = article;
        modalRef.componentInstance.operation = "update";
        modalRef.result.then((result) => {
          this.getFinalArticles();
        }, (reason) => {
          this.getFinalArticles();
        });
        break;
      case 'delete':
        modalRef = this._modalService.open(DeleteArticleComponent, { size: 'lg' });
        modalRef.componentInstance.article = article;
        modalRef.result.then((result) => {
          if (result === 'delete_close') {
            this.getFinalArticles();
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
            this.getFinalArticles();
          }
        }, (reason) => {

        });
        break;
      default: ;
    }
  };

  public addItem(articleSelected: Article) {
    
    let movementOfArticle = new MovementOfArticle();
    movementOfArticle.article = articleSelected;
    movementOfArticle.code = articleSelected.code;
    movementOfArticle.description = articleSelected.description;
    movementOfArticle.observation = articleSelected.observation;
    movementOfArticle.basePrice = articleSelected.basePrice;
    movementOfArticle.costPrice = articleSelected.costPrice;
    movementOfArticle.markupPercentage = articleSelected.markupPercentage;
    movementOfArticle.markupPrice = articleSelected.markupPrice;
    movementOfArticle.salePrice = articleSelected.salePrice;
    let tax: Taxes = new Taxes();
    let taxes: Taxes[] = new Array();
    for (let taxAux of articleSelected.taxes) {
      tax.percentage = this.roundNumber.transform(taxAux.percentage);
      tax.tax = taxAux.tax;
      tax.taxBase = this.roundNumber.transform(movementOfArticle.salePrice / ((tax.percentage / 100) + 1));
      tax.taxAmount = this.roundNumber.transform(tax.taxBase * tax.percentage / 100);
      taxes.push(tax);
    }
    movementOfArticle.taxes = taxes;
    movementOfArticle.make = articleSelected.make;
    movementOfArticle.category = articleSelected.category;
    movementOfArticle.barcode = articleSelected.barcode;
    movementOfArticle.amount = 1;
    this.eventAddItem.emit(movementOfArticle);
  }

  public filterItem(articles: Article[]) {
    
    if (articles && articles.length > 0) {
      let article = articles[0];
      if( articles && 
          articles.length === 1 && 
          this.articles.length >= 2 &&
          ( article.barcode === this.filterArticle ||
            article.description === this.filterArticle ||
            article.posDescription === this.filterArticle ||
            article.code === this.filterArticle)) {
        let movementOfArticle = new MovementOfArticle();
        movementOfArticle.article = article;
        movementOfArticle.code = article.code;
        movementOfArticle.description = article.description;
        movementOfArticle.observation = article.observation;
        movementOfArticle.basePrice = article.basePrice;
        movementOfArticle.costPrice = article.costPrice;
        movementOfArticle.markupPercentage = article.markupPercentage;
        movementOfArticle.markupPrice = article.markupPrice;
        movementOfArticle.salePrice = article.salePrice;
        movementOfArticle.make = article.make;
        movementOfArticle.category = article.category;
        movementOfArticle.barcode = article.barcode;
        movementOfArticle.amount = 1;
        this.eventAddItem.emit(movementOfArticle);
      }
      this.filterArticle = "";
    }
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