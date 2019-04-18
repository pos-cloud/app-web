import { Component, OnInit } from '@angular/core';
import { MovementOfArticle } from 'app/models/movement-of-article';
import { Article } from 'app/models/article';
import { Printer } from 'app/models/printer';
import { TransactionService } from 'app/services/transaction.service';
import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ConfigService } from 'app/services/config.service';

import * as moment from 'moment';
import 'moment/locale/es';

import { Config } from './../../app.config'
import { ArticleService } from 'app/services/article.service';
import { ListArticlesComponent } from '../list-articles/list-articles.component';
import { MovementOfArticleService } from 'app/services/movement-of-article.service';
import { ViewTransactionComponent } from '../view-transaction/view-transaction.component';
import { PrintComponent } from '../print/print.component';

@Component({
  selector: 'app-list-movement-of-articles',
  templateUrl: './list-movement-of-articles.component.html',
  styleUrls: ['./list-movement-of-articles.component.css']
})
export class ListMovementOfArticlesComponent implements OnInit {

  public movementsOfArticles: MovementOfArticle[];
  public articleSelected: Article;
  public areTransactionsEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public itemsPerPage = 10;
  public totalItems = 0;
  public items: any[] = new Array();
  public balance: number;
  public startDate: string;
  public endDate: string;
  public printers: Printer[];
  public userCountry: string;

  public orderTerm: string[] = ['updateDate'];
  public currentPage: number = 0;
  public displayedColumns = [
    "transaction.state",
    "transaction.operationType",
    "article._id",
    "operationType",
    "updateDate",
    "transaction.type.name",
    "transaction.letter",
    "transaction.number",
    "transaction.origin",
    "transaction._id",
    "modifyStock",
    "stockMovement",
    "amount",
    "costPrice",
    "salePrice"
  ];
  public filters: any[];
  public filterValue: string;


  constructor(
    public _transactionService: TransactionService,
    public _movementsOfArticle : MovementOfArticleService,
    public _configService : ConfigService,
    public _articleService : ArticleService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) {
    this.movementsOfArticles = new Array();
    this.filters = new Array();
    for(let field of this.displayedColumns) {
      this.filters[field] = "";
    }
    this.startDate = moment('1990-01-01').format('YYYY-MM-DD');
    this.endDate = moment().format('YYYY-MM-DD');
  }

  ngOnInit(): void {

    this.userCountry = Config.country;
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.openModal('article');
    
  }
  public getSummary(): void {

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

    let timezone = "-03:00";
    if(Config.timezone && Config.timezone !== '') {
      timezone =  Config.timezone.split('UTC')[1];
    }

    match += `"article._id" : { "$oid" : "${this.articleSelected._id}"},
              "operationType": { "$ne": "D" },"transaction.operationType" : { "$ne": "D" }, 
              "transaction.state" : "Cerrado","modifyStock" : true,
              "updateDate" : {"$gte": {"$date": "${this.startDate}T00:00:00${timezone}"},
                              "$lte": {"$date": "${this.endDate}T23:59:59${timezone}"}
                              }
              }`;
    

    match = JSON.parse(match);

    let project = {
        "transaction.state":1,
        "transaction.operationType":1,
        "amount":1,
        "article._id":1,
        "operationType":1,
        "updateDate":1,
        "transaction.type.name":1,
        "transaction.letter": { $toString : "$transaction.letter"},
        "transaction.number": { $toString : '$transaction.number'},
        "transaction.origin": { $toString : '$transaction.origin'},
        "transaction._id":1,
        "modifyStock":1,
        "stockMovement":1,
        "costPrice":1,
        "salePrice" : 1
    };

    // AGRUPAMOS EL RESULTADO
    let group = {
        _id: null,
        count: { $sum: 1 },
        movementsOfArticles: { $push: "$$ROOT" }
    };

    let page = 0;
    if(this.currentPage != 0) {
      page = this.currentPage - 1;
    }
    let skip = !isNaN(page * this.itemsPerPage) ?
            (page * this.itemsPerPage) :
                0 // SKIP



    this._movementsOfArticle.getMovementsOfArticlesV2(
        project, // PROJECT
        match, // MATCH
        sortAux, // SORT
        group, // GROUP
        this.itemsPerPage, // LIMIT
        skip // SKIP
    ).subscribe(
      result => {

        if (result.movementsOfArticles) {

          this.loading = false;
          this.movementsOfArticles = result.movementsOfArticles;
          this.totalItems = result.count;
          this.areTransactionsEmpty = false;
          this.getBalance();
          console.log(this.movementsOfArticles)
          } 
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
        this.totalItems = 0;
      }
    );
  }

  public refresh(): void {

    if (this.articleSelected) {
      this.getSummary();
    } else {
      this.showMessage("Debe seleccionar un Producto", 'info', true);
    }
  }

  public getBalance(): void {

    this.balance = 0;

    for(let i = 0; i < this.movementsOfArticles.length; i++) {

        if(this.movementsOfArticles[i].stockMovement == "Entrada") {
          this.balance += parseFloat(this.movementsOfArticles[i].amount.toString());
        } 
        if( this.movementsOfArticles[i].stockMovement == "Salida") {
          this.balance -= parseFloat(this.movementsOfArticles[i].amount.toString());
        }

        if( this.movementsOfArticles[i].stockMovement == "Inventario" ) {
          this.balance = parseFloat( this.movementsOfArticles[i].amount.toString());
        }
        
      }

  }

  public openModal(op: string, movementsOfArticle?: MovementOfArticle): void {

    let modalRef;
    switch (op) {
      case 'view-transaction':
        modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg' });
        modalRef.componentInstance.transactionId = movementsOfArticle.transaction._id;
        break;
      case 'article':
        modalRef = this._modalService.open(ListArticlesComponent, { size: 'lg' });
        modalRef.componentInstance.userType = 'kardex';
        modalRef.result.then(
          (result) => {
            if (result.article) {
              this.articleSelected = result.article;
              this.getSummary();
            }
          }, (reason) => {
          }
        );
        break;
      default: ;
    }
  }

  public pageChange(page): void {
    this.currentPage = page;
    this.getSummary();
  }

  public orderBy(term: string): void {

      if (this.orderTerm[0] === term) {
        this.orderTerm[0] = "-" + term;
      } else {
        this.orderTerm[0] = term;
      }
      this.getSummary();
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
