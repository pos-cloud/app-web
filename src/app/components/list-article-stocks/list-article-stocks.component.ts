import { Component, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { ArticleStock } from './../../models/article-stock';
import { ArticleStockService } from './../../services/article-stock.service';

import { AddArticleStockComponent } from './../../components/add-article-stock/add-article-stock.component';
import { UpdateArticleStockComponent } from './../../components/update-article-stock/update-article-stock.component';

import { PrintComponent } from 'app/components/print/print.component';
import { PrinterService } from '../../services/printer.service';
import { PrinterPrintIn, Printer } from '../../models/printer';

@Component({
  selector: 'app-list-article-stocks',
  templateUrl: './list-article-stocks.component.html',
  styleUrls: ['./list-article-stocks.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None
})

export class ListArticleStocksComponent implements OnInit {

  public articleStocks: ArticleStock[] = new Array();
  public alertMessage: string = '';
  public userType: string;
  public orderTerm: string[] = ['-realStock'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Output() eventAddItem: EventEmitter<ArticleStock> = new EventEmitter<ArticleStock>();
  public itemsPerPage = 10;
  public totalItems = 0;
  public printers: Printer[];

  public totalRealStock = 0;
  public totalCost = 0;
  public totalTotal = 0;

  public currentPage: number = 0;
  public displayedColumns = [
    "realStock",
    "minStock",
    "article.code",
    "article.description",
    "article.costPrice",
    "article.make.description",
    "article.category.description",
    "article.operationType",
    "operationType"
  ];
  public filters: any[];
  public filterValue: string;

  constructor(
    public _articleStockService: ArticleStockService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig,
    public _printerService: PrinterService
  ) {
    this.filters = new Array();
    for(let field of this.displayedColumns) {
      this.filters[field] = "";
    }
   }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getPrinters();
    this.getArticleStocksV2();
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

  public refresh(): void {
    this.getArticleStocksV2();
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
          this.getArticleStocksV2();
        }, (reason) => {
          this.getArticleStocksV2();
        });
        break;
      case 'update':
        modalRef = this._modalService.open(UpdateArticleStockComponent, { size: 'lg' });
        modalRef.componentInstance.articleStock = articleStock;
        modalRef.componentInstance.readonly = false;
        modalRef.result.then((result) => {
          if (result === 'save_close') {
            this.getArticleStocksV2();
          }
        }, (reason) => {

        });
        break;
      case 'print-label':
        modalRef = this._modalService.open(PrintComponent);
        modalRef.componentInstance.articleStock = articleStock;
        modalRef.componentInstance.typePrint = 'label';
        if (this.printers && this.printers.length > 0) {
          for (let printer of this.printers) {
            if (printer.printIn === PrinterPrintIn.Label) {
              modalRef.componentInstance.printer = printer;
            }
          }
        }
        break;
      case 'print-inventario':
        modalRef = this._modalService.open(PrintComponent);
        modalRef.componentInstance.typePrint = 'inventario';
        if (this.printers && this.printers.length > 0) {
          for (let printer of this.printers) {
            if (printer.printIn === PrinterPrintIn.Counter) {
              modalRef.componentInstance.printer = printer;
            }
          }
        }
        break;
      default:
        break;
    }
  };

  public addItem(articleStockSelected) {
    this.eventAddItem.emit(articleStockSelected);
  }

  public getArticleStocksV2() : void {

    this.loading = true;

    /// ORDENAMOS LA CONSULTA
    let sortAux;
    if (this.orderTerm[0].charAt(0) === '-') {
        sortAux = `{ "${this.orderTerm[0].split('-')[1]}" : -1 }`;
    } else {
        sortAux = `{ "${this.orderTerm[0]}" : 1 }`;
    }
    sortAux = JSON.parse(sortAux);

    // FILTRAMOS LA CONSULTA

    let match = `{`;
    for(let i = 0; i < this.displayedColumns.length; i++) {
      let value = this.filters[this.displayedColumns[i]];
      if (value && value != "") {
        match += `"${this.displayedColumns[i]}": { "$regex": "${value}", "$options": "i"}`;
        match += ',';
      }
    }

    match += `"operationType": { "$ne": "D" } , "article.operationType": { "$ne": "D" } }`;
    
    match = JSON.parse(match);

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = {
      "realStock" : 1,
      "minStock" : 1,
      "article.code" : 1,
      "article.description" : 1,
      "article.costPrice" : 1,
      "article.make.description" : 1,
      "article.category.description" : 1,
      "article.operationType" : 1,
      "branchDestination.name" : 1,
      "depositDestination.name" : 1,
      "operationType" : 1,
    }

    // AGRUPAMOS EL RESULTADO
    let group = {
        _id: null,
        count: { $sum: 1 },
        totalCostArticle : { $sum : "$article.costPrice" },
        totalRealStock : { $sum : "$realStock" },
        totalStockValued : { $sum : { $multiply: [ "$article.costPrice", "$realStock" ] } },
        articleStocks: { $push: "$$ROOT" },
    };

    this._articleStockService.getArticleStocksV2(
        project, // PROJECT
        match, // MATCH
        sortAux, // SORT
        group, // GROUP
        0, // LIMIT
        0 // SKIP
    ).subscribe(
      result => {
        this.totalCost = result.totalCostArticle;
        this.totalRealStock = result.totalRealStock;
        this.totalTotal = result.totalStockValued;

        if (result.articleStocks) {
          this.loading = false;
          this.articleStocks = result.articleStocks;
          this.totalItems = result.count;
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
    this.getArticleStocksV2();
  }

  public orderBy(term: string): void {
    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-" + term;
    } else {
      this.orderTerm[0] = term;
    }
    this.getArticleStocksV2();
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
