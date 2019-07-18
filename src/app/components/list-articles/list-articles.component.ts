
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
import { ArticleFields } from 'app/models/article-fields';
import { ArticleFieldType } from 'app/models/article-field';
import { FilterPipe } from 'app/pipes/filter.pipe';
import { AuthService } from 'app/services/auth.service';
import { User } from 'app/models/user';
import { PrintPriceListComponent } from '../print-price-list/print-price-list.component';

@Component({
  selector: 'app-list-articles',
  templateUrl: './list-articles.component.html',
  styleUrls: ['./list-articles.component.scss'],
  providers: [NgbAlertConfig, RoundNumberPipe],
  encapsulation: ViewEncapsulation.None,
})

export class ListArticlesComponent implements OnInit {

  public identity: User;
  public articles: Article[] = new Array();
  public alertMessage: string = '';
  public userType: string = '';
  public orderTerm: string[] = ["description"];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Output() eventAddItem: EventEmitter<MovementOfArticle> = new EventEmitter<MovementOfArticle>();
  @Input() areArticlesVisible: boolean = false;
  @Input() filterArticle: string = '';
  @Input() transaction: Transaction;
  public apiURL = Config.apiURL;
  public itemsPerPage = 10;
  public roundNumber = new RoundNumberPipe();
  public articleType: ArticleType;
  public listTitle: string;
  public currentPage: number = 0;
  public displayedColumns = [
      'type',
      'code',
      'barcode',
      'description',
      'posDescription',
      'make.description',
      'category.description',
      'category.description',
      'costPrice',
      'salePrice',
      'observation',
      'picture',
      'operationType'
  ];
  public filters: any[];
  public totalItems: number = 0;
  public filterPipe: FilterPipe = new FilterPipe();
  public filteredArticles: Article[];

  constructor(
    public _articleService: ArticleService,
    public _router: Router,
    public _modalService: NgbModal,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _printerService: PrinterService,
    public _authService: AuthService
  ) {
    this.filters = new Array();
    this.articles = new Array();
    this.filteredArticles = new Array();
    for(let field of this.displayedColumns) {
      this.filters[field] = "";
    }
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.listTitle = pathLocation[2].charAt(0).toUpperCase() + pathLocation[2].slice(1);

    this._authService.getIdentity.subscribe(
      identity => {
        this.identity = identity;
      }
    );

    if ('Variantes' === this.listTitle) {
      this.articleType = ArticleType.Variant;
    } else if ('Ingredientes' === this.listTitle) {
      this.articleType = ArticleType.Ingredient;
    } else {
      // ENTRA CUANDO SE HACE UNA TRANSACCIÓN O EN LA TABLA
      this.articleType = ArticleType.Final;
    }
    this.getArticles();
  }

  public getArticles(): void {
    
    this.loading = true;

    /// ORDENAMOS LA CONSULTA
    let sort = {};
    if(this.userType === 'pos') {
      sort = { posDescription: 1, description: 1, favourite: -1 };
    } else {
      let sortAux;
      if (this.orderTerm[0].charAt(0) === '-') {
          sortAux = `{ "${this.orderTerm[0].split('-')[1]}" : -1 }`;
      } else {
          sortAux = `{ "${this.orderTerm[0]}" : 1 }`;
      }
      sort = JSON.parse(sortAux);
    }

    // FILTRAMOS LA CONSULTA
    let match = `{`;
    for(let i = 0; i < this.displayedColumns.length; i++) {
      let value = this.filters[this.displayedColumns[i]];
      if (value && value != "") {
        match += `"${this.displayedColumns[i]}": { "$regex": "${value}", "$options": "i"}`;
        if (i < this.displayedColumns.length - 1) {
          match += ',';
        }
      }
    }
    if(this.userType === 'pos') {
       match = `{ "$or": [ { "type": "${ArticleType.Final}"}, {"type": "${ArticleType.Variant}" } ] , "operationType": { "$ne": "D" } }`;
    } else if(this.userType === 'report') {
      if (match.charAt(match.length - 1) === '"' || match.charAt(match.length - 1) === '}') match += `,`;
      match += `"$or": [ { "type": "${ArticleType.Final}"}, {"type": "${ArticleType.Variant}" } ], "containsVariants": false, "operationType": { "$ne": "D" } }`;
    } else {
      if (match.charAt(match.length - 1) === '"' || match.charAt(match.length - 1) === '}') match += `,`;
      match += `"type": "${this.articleType}", "operationType": { "$ne": "D" } }`;
    }
    match = JSON.parse(match);
    let project = {};
    let group = {};
    let limit = 0;
    let skip = 0;

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    if(this.userType === 'pos') {

      project = {
        type:1,
        code:1,
        barcode:1,
        description:1,
        posDescription:1,
        costPrice:1,
        salePrice:1,
        observation:1,
        picture: 1,
        category: 1,
        operationType: 1,
        "make.description": 1,
        "make.visibleSale": 1
      }
    } else {
      project = {
        'type' : 1,
        'code' : 1,
        'barcode' : 1,
        'description' : 1,
        'posDescription' : 1,
        'containsVariants': 1,
        'make.description' : 1,
        'category.description' : 1,
        'costPrice' : { $toString : '$costPrice' },
        'salePrice' : { $toString : '$salePrice' },
        'observation' : 1,
        'picture' : 1,
        'operationType': 1,
        'currency.name': 1
      }

      // AGRUPAMOS EL RESULTADO
      group = {
          _id: null,
          count: { $sum: 1 },
          articles: { $push: "$$ROOT" }
      };

      let page = 0;
      if(this.currentPage != 0) {
        page = this.currentPage - 1;
      }
      skip = !isNaN(page * this.itemsPerPage) ?
              (page * this.itemsPerPage) :
              0 // SKIP
      limit = this.itemsPerPage;
    }

    this._articleService.getArticlesV2(
        project, // PROJECT
        match, // MATCH
        sort, // SORT
        group, // GROUP
        limit, // LIMIT
        skip // SKIP
    ).subscribe(
      result => {
        this.loading = false;
        if(this.userType === 'pos') {
          if (result && result && result.articles) {
            this.articles = result.articles;
            this.totalItems = result.count;
          } else {
            this.articles = new Array();
            this.totalItems = 0;
          }
        } else {
          if (result && result[0] && result[0].articles) {
            this.articles = result[0].articles;
            this.totalItems = result[0].count;
          } else {
            this.articles = new Array();
            this.totalItems = 0;
          }
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
        this.totalItems = 0;
      }
    );
  }

  public pageChange(page): void {
      this.currentPage = page;
      this.getArticles();
  }

  public selectArticle(articleSelected: Article): void {
    this.activeModal.close({ article: articleSelected });
  }

  public orderBy(term: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-" + term;
    } else {
      this.orderTerm[0] = term;
    }

    this.getArticles();
  }

  public refresh(): void {
    this.getArticles();
  }

  async openModal(op: string, article?: Article) {

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
        model.barcode = '';
        model.relations = new Array();
        model.relations.push("make_relation_description");
        model.relations.push("category_relation_description");
        model.relations.push("providers_relation_code");
        model.relations.push("currency_relation_code");
        modalRef.componentInstance.model = model;
        modalRef.result.then((result) => {
          if (result === 'import_close') {
            this.getArticles();
          }
        }, (reason) => {

        });
        break;
      case 'print-label':

        await this.getPrinters().then(
          printers => {
            let labelPrinter: Printer;
            if (printers && printers.length > 0) {
              for (let printer of printers) {
                if (printer.printIn === PrinterPrintIn.Label) {
                  labelPrinter = printer;
                }
              }
            }

            if(labelPrinter) {
              modalRef = this._modalService.open(PrintComponent);
              if(article) {
                modalRef.componentInstance.article = article;
              } else {
                modalRef.componentInstance.articles = this.articles;
              }
              modalRef.componentInstance.typePrint = 'label';
              modalRef.componentInstance.printer = labelPrinter;
            } else {
              this.showMessage('Debe definir un modelo de impresora como etiqueta en el menu Configuración->Impresoras', "info", true);
            }
          }
        );
        break;
      case 'print-list':
        modalRef = this._modalService.open(PrintPriceListComponent);
        modalRef.result.then((result) => {
          this.getArticles();
        }, (reason) => {
          this.getArticles();
        });
        break;
      case 'update-prices':
        modalRef = this._modalService.open(UpdateArticlePriceComponent);
        modalRef.componentInstance.operation = "update-prices";
        modalRef.result.then((result) => {
          this.getArticles();
        }, (reason) => {
          this.getArticles();
        });
        break;
      default: ;
    }
  };

  public getPrinters(): Promise<Printer[]> {

    return new Promise<Printer[]>( async (resolve, reject) => {

      this.loading = true;

      this._printerService.getPrinters().subscribe(
        result => {
          this.loading = false;
          if (!result.printers) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.printers);
          }
        },
        error => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  async addItem(articleSelected: Article) {

    await this.getArticle(articleSelected._id).then(
      article => {
        if(article) {
          let movementOfArticle = new MovementOfArticle();
          movementOfArticle.article = article;
          movementOfArticle.code = article.code;
          movementOfArticle.codeSAT = article.codeSAT;
          movementOfArticle.description = article.description;
          movementOfArticle.observation = article.observation;
          movementOfArticle.make = article.make;
          movementOfArticle.category = article.category;
          movementOfArticle.barcode = article.barcode;
          movementOfArticle.transaction = this.transaction;
          movementOfArticle.modifyStock = this.transaction.type.modifyStock;
          if(this.transaction.type.stockMovement) {
            movementOfArticle.stockMovement = this.transaction.type.stockMovement.toString();
          }

          let quotation = 1;
          if(this.transaction.quotation) {
            quotation = this.transaction.quotation;
          }

          movementOfArticle.basePrice = this.roundNumber.transform(article.basePrice);

          if(article.currency &&
            Config.currency &&
            Config.currency._id !== article.currency._id) {
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
              movementOfArticle.costPrice = this.roundNumber.transform(article.costPrice);
              movementOfArticle.markupPercentage = article.markupPercentage;
              movementOfArticle.markupPrice = this.roundNumber.transform(article.markupPrice);
              movementOfArticle.unitPrice = this.roundNumber.transform(article.salePrice);
              movementOfArticle.salePrice = this.roundNumber.transform(article.salePrice);

              if(article.currency &&
                Config.currency &&
                Config.currency._id !== article.currency._id) {
                  movementOfArticle.costPrice = this.roundNumber.transform(movementOfArticle.costPrice * quotation);
                  movementOfArticle.markupPrice = this.roundNumber.transform(movementOfArticle.markupPrice * quotation);
                  movementOfArticle.unitPrice = this.roundNumber.transform(movementOfArticle.salePrice * quotation);
                  movementOfArticle.salePrice = this.roundNumber.transform(movementOfArticle.salePrice * quotation);
              }
              if (this.transaction.type.requestTaxes) {
                let taxes: Taxes[] = new Array();
                if (article.taxes) {
                  for (let taxAux of article.taxes) {
                    let tax: Taxes = new Taxes();
                    tax.tax = taxAux.tax;
                    tax.percentage = this.roundNumber.transform(taxAux.percentage);
                    if(tax.percentage && tax.percentage !== 0) {
                      tax.taxBase = (movementOfArticle.salePrice / ((tax.percentage / 100) + 1));
                      tax.taxAmount = (tax.taxBase * tax.percentage / 100);
                    } else {
                      tax.taxAmount = taxAux.taxAmount;
                    }
                    tax.taxBase = this.roundNumber.transform(tax.taxBase);
                    tax.taxAmount = this.roundNumber.transform(tax.taxAmount);
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
            if(this.transaction.type.requestTaxes) {
              let taxes: Taxes[] = new Array();
              if (article.taxes) {
                for (let taxAux of article.taxes) {
                  taxAux.taxBase = this.roundNumber.transform(taxedAmount);
                  if(taxAux.percentage && taxAux.percentage !== 0) {
                    taxAux.taxAmount = this.roundNumber.transform((taxAux.taxBase * taxAux.percentage / 100));
                  }
                  taxes.push(taxAux);
                  movementOfArticle.costPrice += taxAux.taxAmount;
                }
                movementOfArticle.taxes = taxes;
              }
            }
            movementOfArticle.costPrice += this.roundNumber.transform(taxedAmount);
            movementOfArticle.unitPrice = movementOfArticle.basePrice;
            movementOfArticle.salePrice = movementOfArticle.costPrice;
          }
          this.areArticlesVisible = true;
          this.eventAddItem.emit(movementOfArticle);
        }
      }
    );
  }

  public getArticle(articleId: string): Promise<Article> {

    return new Promise<Article> ((resolve, reject) => {

      this._articleService.getArticle(articleId).subscribe(
        result => {
          if (!result.article) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.article);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public filterItem(category?: Category) {

    if(category) {
      this.filteredArticles = this.filterPipe.transform(this.articles, category._id, 'category');
      this.filteredArticles = this.filterPipe.transform(this.filteredArticles, ArticleType.Final.toString(), 'type');
      if (this.filterArticle && this.filterArticle !== "") {
        this.filteredArticles = this.filterPipe.transform(this.filteredArticles, this.filterArticle);
      }
    } else if(this.filterArticle && this.filterArticle !== "") {

      this.filteredArticles = this.filterPipe.transform(this.articles, this.filterArticle);

      if (this.filteredArticles && this.filteredArticles.length > 0 && this.articles && this.articles.length >= 2) {

        this.hideMessage();

        let article;
        var count = 1;

        if (this.filteredArticles.length === 1) {
          article = this.filteredArticles[0];
        } else if (this.filteredArticles.length > 1) {
          count = 0;
          for(let art of this.filteredArticles) {
            if(art.type === ArticleType.Final) {
              count++;
              article = art;
            }
          }
        }

        if (  count === 1 &&
              this.filterArticle &&
            ( article &&
              (article.barcode && article.barcode === this.filterArticle) ||
              (article.description && article.description.toUpperCase() === this.filterArticle.toUpperCase()) ||
              (article.posDescription && article.posDescription.toUpperCase() === this.filterArticle.toUpperCase()) ||
              (article.code && article.code === this.filterArticle))) {
                this.filterArticle = '';
                this.addItem(article);
        } else {
          this.filteredArticles = this.filterPipe.transform(this.filteredArticles, ArticleType.Final.toString(), 'type');
          this.eventAddItem.emit(null);
        }
      } else {
        this.filteredArticles = this.filterPipe.transform(this.filteredArticles, ArticleType.Final.toString(), 'type');
        this.eventAddItem.emit(null);
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
