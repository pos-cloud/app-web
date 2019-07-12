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
import { RoundNumberPipe } from 'app/pipes/round-number.pipe';
import { TransactionState } from 'app/models/transaction';

@Component({
  selector: 'app-list-movement-of-articles',
  templateUrl: './list-movement-of-articles.component.html',
  styleUrls: ['./list-movement-of-articles.component.css']
})

export class ListMovementOfArticlesComponent implements OnInit {

  public articleSelected: Article;
  public areTransactionsEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public itemsPerPage = 10;
  public totalItems = 0;
  public items: any[];
  public balance: number;
  public startDate: string;
  public endDate: string;
  public printers: Printer[];
  public userCountry: string;
  public roundNumber: RoundNumberPipe;

  public orderTerm: string[] = ['transaction.endDate'];
  public currentPage: number = 0;
  public displayedColumns = [
    "transaction.state",
    "transaction.operationType",
    "article._id",
    "operationType",
    "transaction.endDate",
    "transaction.type.name",
    "transaction.type.transactionMovement",
    "transaction.letter",
    "transaction.number",
    "transaction.origin",
    "transaction.company.name",
    "transaction._id",
    "modifyStock",
    "stockMovement",
    "amount",
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
    this.roundNumber = new RoundNumberPipe();
    this.items = new Array();
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
              "transaction.state" : "${TransactionState.Closed}","modifyStock" : true,
              "transaction.endDate" : {"$gte": {"$date": "${this.startDate}T00:00:00${timezone}"},
                              "$lte": {"$date": "${this.endDate}T23:59:59${timezone}"}
                              }
              }`;

    match = JSON.parse(match);

    let project = {
        "transaction.state": 1,
        "transaction.operationType": 1,
        "article._id": 1,
        "operationType": 1,
        "transaction.endDate": { $dateFromString: { dateString: { $dateToString: { date: "$transaction.endDate", timezone: timezone } }}},
        "transaction.type.name": 1,
        "transaction.type.transactionMovement" : 1,
        "transaction.letter": { $toString : "$transaction.letter"},
        "transaction.number": { $toString : '$transaction.number'},
        "transaction.origin": { $toString : '$transaction.origin'},
        "transaction.company.name" : 1,
        "transaction._id": 1,
        "modifyStock": 1,
        "stockMovement": 1,
        "amount": 1
    };

    // AGRUPAMOS EL RESULTADO
    let group = {
        _id: null,
        count: { $sum: 1 },
        movementsOfArticles: { $push: "$$ROOT" }
    };

    let limit = 0;
    let skip = 0;
                
    this._movementsOfArticle.getMovementsOfArticlesV2(
        project, // PROJECT
        match, // MATCH
        sortAux, // SORT
        group, // GROUP
        limit, // LIMIT
        skip // SKIP
    ).subscribe(
      result => {
        this.loading = false;
        if(result && result[0] && result[0].movementsOfArticles) {
          this.items = result[0].movementsOfArticles;
          this.totalItems = result[0].count;
          this.areTransactionsEmpty = false;
          this.currentPage = parseFloat(this.roundNumber.transform(this.totalItems / this.itemsPerPage + 0.5, 0).toFixed(0));
        } else {
          this.items = new Array();
          this.totalItems = 0;
          this.areTransactionsEmpty = true;
          this.currentPage = 0;
        }
        this.getBalance();
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

    let i = 0;
    for(let movementOfArticle of this.items) {
      if(movementOfArticle.stockMovement == "Entrada") {
        this.balance += movementOfArticle.amount;
      } 
      if( movementOfArticle.stockMovement == "Salida") {
        this.balance -= movementOfArticle.amount;
      }
      if( movementOfArticle.stockMovement == "Inventario" ) {
        this.balance = movementOfArticle.amount;
      }
      this.items[i].balance = this.balance;
      i++;
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
