
import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

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
import { UpdateArticlePriceComponent } from '../update-article-price/update-article-price.component';
import { OrderByPipe } from 'app/pipes/order-by.pipe';
import { ArticleFields } from 'app/models/article-fields';
import { ArticleFieldType } from 'app/models/article-field';

@Component({
  selector: 'app-list-articles',
  templateUrl: './list-articles.component.html',
  styleUrls: ['./list-articles.component.scss'],
  providers: [NgbAlertConfig, RoundNumberPipe],
  encapsulation: ViewEncapsulation.None
})

export class ListArticlesComponent implements OnInit {

  public articles: Article[] = new Array();
  public areArticlesEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string = '';
  public orderTerm: string[];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Output() eventAddItem: EventEmitter<MovementOfArticle> = new EventEmitter<MovementOfArticle>();
  @Input() areArticlesVisible: boolean = true;
  @Input() filterCategorySelected: Category;
  @Input() filterArticle: string = '';
  @Input() transaction: Transaction;
  public apiURL = Config.apiURL;
  public itemsPerPage = 10;
  public roundNumber = new RoundNumberPipe();
  public printers: Printer[];
  public totals: string[];
  public articleType: ArticleType;
  public listTitle: string;

  constructor(
    public _articleService: ArticleService,
    public _router: Router,
    public _modalService: NgbModal,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _printerService: PrinterService
  ) {
    if (this.filterCategorySelected === undefined) {
      this.filterCategorySelected = new Category();
      this.filterCategorySelected.description = '';
    }

    if (this.filterArticle === undefined) {
      this.filterArticle = '';
    }
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.listTitle = pathLocation[2].charAt(0).toUpperCase() + pathLocation[2].slice(1);
    if(this.userType === 'pos') {
      this.orderTerm = ['posDescription', '-favourite'];
    } else {
      this.orderTerm = ['description'];
    }
    if ('Variantes' === this.listTitle) {
      this.articleType = ArticleType.Variant;
    } else if ('Ingredientes' === this.listTitle) {
      this.articleType = ArticleType.Ingredient;
    } else {
      // ENTRA CUANDO SE HACE UNA TRANSACCIÓN O EN LA TABLA
      this.articleType = ArticleType.Final;
    }
    this.totals = new Array();
    this.getPrinters();
    this.getArticles();
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
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getArticles(): void {

    this.loading = true;
    let query = '';

    if (this.userType === 'pos') {
      query = 'where="$or":[{"type":"' + ArticleType.Final + '"},{"type":"' + ArticleType.Variant +'"}]';
    } else {
      query = 'where="type":"' + this.articleType + '"';
    }
    query += '&statistics=true';

    this._articleService.getArticles(query).subscribe(
      result => {
        if (!result.articles) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
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
          let orderBy2 = new OrderByPipe();
          this.articles = orderBy2.transform(result.articles, ['posDescription']);
          this.articles = orderBy2.transform(this.articles, ['-favourite']);
          this.areArticlesEmpty = false;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public selectArticle(articleSelected: Article): void {
    this.activeModal.close({ article: articleSelected });
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

  public openModal(op: string, article?: Article, typeOfOperationToPrint?: string): void {

    let modalRef;
    switch (op) {
      case 'view':
        modalRef = this._modalService.open(AddArticleComponent, { size: 'lg' });
        modalRef.componentInstance.articleId = article._id;
        modalRef.componentInstance.operation = "view";
        break;
      case 'add':
        modalRef = this._modalService.open(AddArticleComponent, { size: 'lg' });
        modalRef.componentInstance.operation = "add";
        modalRef.result.then((result) => {
          this.getArticles();
        }, (reason) => {
          this.getArticles();
        });
        break;
      case 'update':
        modalRef = this._modalService.open(AddArticleComponent, { size: 'lg' });
        modalRef.componentInstance.articleId = article._id;
        modalRef.componentInstance.operation = "update";
        modalRef.result.then((result) => {
          this.getArticles();
        }, (reason) => {
          this.getArticles();
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
        model.type = '';
        model.description = '';
        model.basePrice = '';
        model.costPrice = '';
        model.markupPercentage = '';
        model.markupPrice = '';
        model.salePrice = '';
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
      case 'print':
        modalRef = this._modalService.open(PrintComponent);
        if(article) {
          modalRef.componentInstance.article = article;
        } else {
          modalRef.componentInstance.articles = this.articles;
        }
        modalRef.componentInstance.typePrint = typeOfOperationToPrint;
        if (this.printers && this.printers.length > 0) {
          for (let printer of this.printers) {
            if (typeOfOperationToPrint === 'label') {
              if (printer.printIn === PrinterPrintIn.Label) {
                modalRef.componentInstance.printer = printer;
              }
            } else {
              if (printer.printIn === PrinterPrintIn.Counter) {
                modalRef.componentInstance.printer = printer;
              }
            }
          }
        }
          break;
        case 'update-prices':
          modalRef = this._modalService.open(UpdateArticlePriceComponent);
          modalRef.componentInstance.operation = "update-prices";
          break;
      default: ;
    }
  };

  public addItem(articleSelected: Article) {

    let movementOfArticle = new MovementOfArticle();
    movementOfArticle.article = articleSelected;
    movementOfArticle.code = articleSelected.code;
    movementOfArticle.codeSAT = articleSelected.codeSAT;
    movementOfArticle.description = articleSelected.description;
    movementOfArticle.observation = articleSelected.observation;
    movementOfArticle.make = articleSelected.make;
    movementOfArticle.category = articleSelected.category;
    movementOfArticle.barcode = articleSelected.barcode;
    movementOfArticle.transaction = this.transaction;

    let quotation = 1;
    if(this.transaction.quotation) {
      quotation = this.transaction.quotation;
    }

    movementOfArticle.basePrice = this.roundNumber.transform(articleSelected.basePrice);

    if(articleSelected.currency &&  
      Config.currency && 
      Config.currency._id !== articleSelected.currency._id) {
      movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.basePrice * quotation);
    }

    if (this.transaction &&
      this.transaction.type &&
      this.transaction.type.transactionMovement === TransactionMovement.Sale) {
        let fields: ArticleFields[] = new Array();
        if (movementOfArticle.otherFields && movementOfArticle.otherFields.length > 0) {
          for (const field of movementOfArticle.otherFields) {
            if (field.datatype === ArticleFieldType.Percentage) {
              field.amount = this.roundNumber.transform((movementOfArticle.basePrice * parseFloat(field.value) / 100));
            } else if (field.datatype === ArticleFieldType.Number) {
              field.amount = parseFloat(field.value);
            }
            fields.push(field);
          }
        }
        movementOfArticle.otherFields = fields;
        movementOfArticle.costPrice = this.roundNumber.transform(articleSelected.costPrice);
        movementOfArticle.markupPercentage = articleSelected.markupPercentage;
        movementOfArticle.markupPrice = this.roundNumber.transform(articleSelected.markupPrice);
        movementOfArticle.unitPrice = this.roundNumber.transform(articleSelected.salePrice);
        movementOfArticle.salePrice = this.roundNumber.transform(articleSelected.salePrice);

        if(articleSelected.currency &&  
          Config.currency && 
          Config.currency._id !== articleSelected.currency._id) {
            movementOfArticle.costPrice = this.roundNumber.transform(movementOfArticle.costPrice * quotation);
            movementOfArticle.markupPrice = this.roundNumber.transform(movementOfArticle.markupPrice * quotation);
            movementOfArticle.unitPrice = this.roundNumber.transform(movementOfArticle.salePrice * quotation);
            movementOfArticle.salePrice = this.roundNumber.transform(movementOfArticle.salePrice * quotation);
        }
        if(this.transaction.type.requestTaxes) {
          let tax: Taxes = new Taxes();
          let taxes: Taxes[] = new Array();
          if (articleSelected.taxes) {
            for (let taxAux of articleSelected.taxes) {
              tax.percentage = this.roundNumber.transform(taxAux.percentage);
              tax.tax = taxAux.tax;
              tax.taxBase = this.roundNumber.transform((movementOfArticle.salePrice / ((tax.percentage / 100) + 1)));
              tax.taxAmount = this.roundNumber.transform((tax.taxBase * tax.percentage / 100));
              taxes.push(tax);
            }
          }
          movementOfArticle.taxes = taxes;
        }
    } else {
      movementOfArticle.markupPercentage = 0;
      movementOfArticle.markupPrice = 0;

      let taxedAmount = movementOfArticle.basePrice;
      movementOfArticle.costPrice = 0;

      let fields: ArticleFields[] = new Array();
      if (movementOfArticle.otherFields && movementOfArticle.otherFields.length > 0) {
        for (const field of movementOfArticle.otherFields) {
          if (field.datatype === ArticleFieldType.Percentage) {
            field.amount = this.roundNumber.transform((movementOfArticle.basePrice * parseFloat(field.value) / 100));
          } else if (field.datatype === ArticleFieldType.Number) {
            field.amount = parseFloat(field.value);
          }
          if (field.articleField.modifyVAT) {
            taxedAmount += field.amount;
          } else {
            movementOfArticle.costPrice += field.amount;
          }
          fields.push(field);
        }
      }
      movementOfArticle.otherFields = fields;
      if (this.transaction && this.transaction.type && this.transaction.type.requestTaxes) {
        if (movementOfArticle.taxes && movementOfArticle.taxes.length > 0) {
          let taxes: Taxes[] = new Array();
          for (let articleTax of movementOfArticle.taxes) {
            articleTax.taxBase = taxedAmount;
            articleTax.taxAmount = this.roundNumber.transform((articleTax.taxBase * articleTax.percentage / 100));
            taxes.push(articleTax);
            movementOfArticle.costPrice += articleTax.taxAmount;
          }
          movementOfArticle.taxes = taxes;
        }
      }
      movementOfArticle.costPrice += this.roundNumber.transform(taxedAmount);
      movementOfArticle.unitPrice = movementOfArticle.basePrice;
      movementOfArticle.salePrice = movementOfArticle.costPrice;
    }
    this.eventAddItem.emit(movementOfArticle);
  }

  public filterItem(articles: Article[]) {

    if (articles && articles.length > 0 && this.articles && this.articles.length >= 2) {

      let article;
      var count = 1;

      if (articles.length === 1) {
        article = articles[0];
      } else if (articles.length > 1) {
        count = 0;
        for(let art of articles) {
          if(art.type === ArticleType.Final) {
            count++;
            article = art;
          }
        }
      }

      if (  count === 1 &&
            this.filterArticle &&
          ( article &&
            article.barcode === this.filterArticle ||
            article.description.toUpperCase() === this.filterArticle.toUpperCase() ||
            article.posDescription.toUpperCase() === this.filterArticle.toUpperCase() ||
            article.code === this.filterArticle)) {
              this.filterArticle = '';
              this.addItem(article);
      }
    }
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}