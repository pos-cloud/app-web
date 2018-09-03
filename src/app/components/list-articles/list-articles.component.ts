
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { Article, ArticleType } from './../../models/article';
import { Category } from './../../models/category';
import { Config } from './../../app.config';
import { MovementOfArticle } from '../../models/movement-of-article';
import { Taxes } from './../../models/taxes';
import { Transaction } from './../../models/transaction';

import { ArticleService } from './../../services/article.service';

import { AddArticleComponent } from './../../components/add-article/add-article.component';
import { DeleteArticleComponent } from './../../components/delete-article/delete-article.component';
import { ImportComponent } from './../../components/import/import.component';
import { PrintComponent } from 'app/components/print/print.component';

import { RoundNumberPipe } from './../../pipes/round-number.pipe';
import { Printer, PrinterPrintIn } from '../../models/printer';
import { PrinterService } from '../../services/printer.service';
import { TransactionMovement } from '../../models/transaction-type';

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
  public userType: string = "";
  public orderTerm: string[] = ['code'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Output() eventAddItem: EventEmitter<MovementOfArticle> = new EventEmitter<MovementOfArticle>();
  @Input() areArticlesVisible: boolean = true;
  @Input() filterCategorySelected: Category;
  @Input() filterArticle: string = "";
  @Input() transaction: Transaction;
  public apiURL = Config.apiURL;
  public itemsPerPage = 10;
  public roundNumber = new RoundNumberPipe();
  public printers: Printer[];
  public totals: string[];

  constructor(
    public _articleService: ArticleService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig,
    public _printerService: PrinterService
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
    this.totals = new Array();
    this.getPrinters();
    this.getFinalArticles();
  }

  public getPrinters(): void {

    this.loading = true;

    this._printerService.getPrinters().subscribe(
      result => {
        if (!result.printers) {
          this.printers = new Array();
        } else {
          this.hideMessage();
          this.printers = result.printers;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getFinalArticles(field?: string): void {

    this.loading = true;

    let query = 'where="type":"' + ArticleType.Final;

    query += '"&statistics=true';

    this._articleService.getArticles(query).subscribe(
      result => {
        if (!result.articles) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.loading = false;
          this.articles = null;
          this.areArticlesEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.totals["count"] = result.count;
          this.totals["basePrice"] = result.basePrice;
          this.totals["costPrice"] = result.costPrice;
          this.totals["markupPercentage"] = result.markupPercentage;
          this.totals["markupPrice"] = result.markupPrice;
          this.totals["salePrice"] = result.salePrice;
          this.articles = result.articles;
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
      case 'print':
        modalRef = this._modalService.open(PrintComponent);
        modalRef.componentInstance.article = article;
        modalRef.componentInstance.typePrint = 'label';
        if (this.printers && this.printers.length > 0) {
          for (let printer of this.printers) {
            if (printer.printIn === PrinterPrintIn.Label) {
              modalRef.componentInstance.printer = printer;
            }
          }
        }
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
    if(this.transaction &&
      this.transaction.type &&
      this.transaction.type.transactionMovement === TransactionMovement.Sale) {
        movementOfArticle.markupPercentage = articleSelected.markupPercentage;
        movementOfArticle.markupPrice = articleSelected.markupPrice;
        movementOfArticle.salePrice = articleSelected.salePrice;
    } else {
      movementOfArticle.markupPercentage = 0;
      movementOfArticle.markupPrice = 0;
      movementOfArticle.salePrice = articleSelected.costPrice;
    }
    let tax: Taxes = new Taxes();
    let taxes: Taxes[] = new Array();
    if (articleSelected.taxes) {
      for (let taxAux of articleSelected.taxes) {
        tax.percentage = this.roundNumber.transform(taxAux.percentage);
        tax.tax = taxAux.tax;
        tax.taxBase = this.roundNumber.transform(movementOfArticle.salePrice / ((tax.percentage / 100) + 1));
        tax.taxAmount = this.roundNumber.transform(tax.taxBase * tax.percentage / 100);
        taxes.push(tax);
      }
    }
    movementOfArticle.taxes = taxes;
    movementOfArticle.make = articleSelected.make;
    movementOfArticle.category = articleSelected.category;
    movementOfArticle.barcode = articleSelected.barcode;
    movementOfArticle.amount = 1;
    this.eventAddItem.emit(movementOfArticle);
  }

  public filterItem(articles: Article[]) {
    
    if (articles && articles.length > 0 && this.articles.length >= 2) {
      let article = articles[0];
      if( articles.length === 1 &&
          ( article.barcode === this.filterArticle ||
            article.description.toUpperCase() === this.filterArticle.toUpperCase() ||
            article.posDescription.toUpperCase() === this.filterArticle.toUpperCase() ||
            article.code === this.filterArticle)) {
              let movementOfArticle = new MovementOfArticle();
              movementOfArticle.article = article;
              movementOfArticle.code = article.code;
              movementOfArticle.description = article.description;
              movementOfArticle.observation = article.observation;
              movementOfArticle.basePrice = article.basePrice;
              movementOfArticle.costPrice = article.costPrice;
              if(this.transaction &&
                this.transaction.type &&
                this.transaction.type.transactionMovement === TransactionMovement.Sale) {
                  movementOfArticle.markupPercentage = article.markupPercentage;
                  movementOfArticle.markupPrice = article.markupPrice;
                  movementOfArticle.salePrice = article.salePrice;
              } else {
                movementOfArticle.markupPercentage = 0;
                movementOfArticle.markupPrice = 0;
                movementOfArticle.salePrice = article.costPrice;
              }
              let tax: Taxes = new Taxes();
              let taxes: Taxes[] = new Array();
              if (article.taxes) {
                for (let taxAux of article.taxes) {
                  tax.percentage = this.roundNumber.transform(taxAux.percentage);
                  tax.tax = taxAux.tax;
                  tax.taxBase = this.roundNumber.transform(movementOfArticle.salePrice / ((tax.percentage / 100) + 1));
                  tax.taxAmount = this.roundNumber.transform(tax.taxBase * tax.percentage / 100);
                  taxes.push(tax);
                }
              }
              movementOfArticle.taxes = taxes;
              movementOfArticle.make = article.make;
              movementOfArticle.category = article.category;
              movementOfArticle.barcode = article.barcode;
              movementOfArticle.amount = 1;
              this.filterArticle = "";
              this.eventAddItem.emit(movementOfArticle);
      }
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