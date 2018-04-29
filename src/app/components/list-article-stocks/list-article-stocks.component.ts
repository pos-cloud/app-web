import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { ArticleStock } from './../../models/article-stock';
import { ArticleStockService } from './../../services/article-stock.service';

import { AddArticleStockComponent } from './../../components/add-article-stock/add-article-stock.component';
import { UpdateArticleStockComponent } from './../../components/update-article-stock/update-article-stock.component';
import { ImportComponent } from './../../components/import/import.component';

@Component({
  selector: 'app-list-article-stocks',
  templateUrl: './list-article-stocks.component.html',
  styleUrls: ['./list-article-stocks.component.css'],
  providers: [NgbAlertConfig]
})

export class ListArticleStocksComponent implements OnInit {

  public articleStocks: ArticleStock[] = new Array();
  public areArticleStocksEmpty: boolean = true;
  public alertMessage: string = "";
  public userType: string;
  public orderTerm: string[] = ['description'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Output() eventAddItem: EventEmitter<ArticleStock> = new EventEmitter<ArticleStock>();
  public itemsPerPage = 10;
  public totalItems = 0;

  constructor(
    public _articleStockService: ArticleStockService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getArticleStocks();
  }

  public getArticleStocks(): void {

    this.loading = true;

    this._articleStockService.getArticleStocks().subscribe(
      result => {
        console.log(result);
        if (!result.articleStocks || result.articleStocks.length <= 0) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
          this.articleStocks = null;
          this.areArticleStocksEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.articleStocks = result.articleStocks;
          this.totalItems = this.articleStocks.length;
          this.areArticleStocksEmpty = false;
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
    this.getArticleStocks();
  }

  public openModal(op: string, articleStock: ArticleStock): void {

    let modalRef;
    switch (op) {
      case 'view':
        modalRef = this._modalService.open(UpdateArticleStockComponent, { size: 'lg' });
        modalRef.componentInstance.articleStock = articleStock;
        modalRef.componentInstance.readonly = true;
        break;
      case 'add':
        modalRef = this._modalService.open(AddArticleStockComponent, { size: 'lg' }).result.then((result) => {
          this.getArticleStocks();
        }, (reason) => {
          this.getArticleStocks();
        });
        break;
      case 'update':
        modalRef = this._modalService.open(UpdateArticleStockComponent, { size: 'lg' });
        modalRef.componentInstance.articleStock = articleStock;
        modalRef.componentInstance.readonly = false;
        modalRef.result.then((result) => {
          if (result === 'save_close') {
            this.getArticleStocks();
          }
        }, (reason) => {

        });
        break;
      default: ;
    }
  };

  public addItem(articleStockSelected) {
    this.eventAddItem.emit(articleStockSelected);
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