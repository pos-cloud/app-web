import { Component, OnInit, Input } from '@angular/core';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TransactionType,TransactionMovement } from '../../models/transaction-type'
import { Transaction } from '../../models/transaction'

//service
import { CancellationTypeService } from "../../services/cancellation-type.service"
import { TransactionService } from "../../services/transaction.service";
import { MovementOfArticleService } from "../../services/movement-of-article.service"

import { CancellationType } from 'app/models/cancellation-type';
import { CompanyService } from 'app/services/company.service';
import { ViewTransactionComponent } from '../view-transaction/view-transaction.component';
import { MovementOfArticle } from 'app/models/movement-of-article';
import { MovementOfCashService } from 'app/services/movement-of-cash.service';
import { MovementOfCancellationService } from 'app/services/movement-of-cancellation';

@Component({
  selector: 'app-movement-of-cancellation',
  templateUrl: './movement-of-cancellation.component.html',
  styleUrls: ['./movement-of-cancellation.component.css']
})
export class MovementOfCancellationComponent implements OnInit {

  @Input() transaccionDestinationId: string;
  public transactionDestination: Transaction;

  public transactionMovement: TransactionMovement;
  public transactions: Transaction[];
  public movementOfarticles: MovementOfArticle[] = new Array();
  public transactionOrigin : Transaction[] = new Array();
  public transactionTypes: TransactionType[]
  public cancellationTypes : CancellationType[];
  public alertMessage: string = '';
  public loading: boolean = false;
  public itemsPerPage: number = 10;
  public totalItems: number = -1;
  public orderTerm: string[] = ['-endDate'];
  public currentPage: number = 0;
  public existingCanceled = [];
  public displayedColumns = [
      'type.name',
      '_id',
      'type._id',
      'company._id',
      'number',
      'letter',
      'totalPrice',
      'state',
      'operationType',
      'type.requestArticles',
      'balance'
  ];
  public filters: any[];
  public filterValue: string;

  constructor(
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _cancellationTypeService : CancellationTypeService,
    public _movementOfCancellation : MovementOfCancellationService,
    public _transactionService : TransactionService,
    public _companyService: CompanyService,
    public _modalService: NgbModal,
    public _movementOfCashService : MovementOfCashService,
    public _movementOfArticleService : MovementOfArticleService,
  ) { 
    this.filters = new Array();
    for(let field of this.displayedColumns) {
      this.filters[field] = "";
    }
    
  }

  ngOnInit() {
    
    this.getCancellation();
  }

  public getCancellation():void {
        // ORDENAMOS LA CONSULTA
        
        let sortAux = { order: 1 };
    
        // FILTRAMOS LA CONSULTA
        let match = { "operationType": { "$ne": "D" } };
        
        // CAMPOS A TRAER
        let project = {
          "transactionOrigin": 1,
          "_id":0
        };
    
        // AGRUPAMOS EL RESULTADO
        let group = {};
    
        let limit = 0;
    
        let skip = 0;
    
        this._movementOfCancellation.getMovementOfCancellations(
          project, // PROJECT
          match, // MATCH
          sortAux, // SORT
          group, // GROUP
          limit, // LIMIT
          skip // SKIP
        ).subscribe(result => {

          if (result.movementOfCancellations) {
            
           // this.existingCanceled = result.movementOfCancellations;

            for (let index = 0; index < result.movementOfCancellations.length; index++) {
              
             // this.existingCanceled.push(result.movementOfCancellations[index].transactionOrigin)

              this.existingCanceled[index] = `"${result.movementOfCancellations[index].transactionOrigin}"`

            }

            this.getTransaction();
    
          } else {
    
          }
    
        });

  }

  public getTransaction(): void {

    this.loading = true;

    this._transactionService.getTransaction(this.transaccionDestinationId).subscribe(
      result => {
        if (!result.transaction) {
          this.showMessage(result.message, 'danger', false);
          this.loading = false;
        } else {
          this.hideMessage();
          this.transactionDestination = result.transaction;
          this.getCancellationTypes();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getCancellationTypes() : void {

    // ORDENAMOS LA CONSULTA
    let sortAux = { order: 1 };
    
    // FILTRAMOS LA CONSULTA
    let match = { "destination._id": { $oid: this.transactionDestination.type._id} , "operationType": { "$ne": "D" } };
    
    // CAMPOS A TRAER
    let project = {
      "origin": 1,
      "destination": 1,
      "operationType" : 1
    };

    // AGRUPAMOS EL RESULTADO
    let group = {};

    let limit = 0;

    let skip = 0;

    this._cancellationTypeService.getCancellationTypes(
      project, // PROJECT
      match, // MATCH
      sortAux, // SORT
      group, // GROUP
      limit, // LIMIT
      skip // SKIP
    ).subscribe(result => {
      if (result.cancellationTypes) {
        
        this.cancellationTypes = result.cancellationTypes;

        this.getTransactions();

      } else {

      }

    });
  }

  public getTransactions(){
    
    
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

    if(this.cancellationTypes.length != 0) {
      
      match += `"$or": [`
      for (let index = 0; index < this.cancellationTypes.length; index++) {
        match +=  `{ "type._id"  : "${this.cancellationTypes[index].origin._id}"}`;
        if(index < this.cancellationTypes.length) {
          match += ','
        }
      }
  
      match = match.slice(0, -1);
  
      match += `],`
    } else {
      match +=  `{ "type._id"  : "${this.cancellationTypes[0].origin._id}"}`
    }

    //, "_id": {"$nin": [${this.existingCanceled}]
    //"balance": { "$gt": 0 }

    match += `"operationType": { "$ne": "D" } , "state" : "Cerrado" , "company._id":  "${this.transactionDestination.company._id}","balance": { "$gt": "0" } }`;

    match = JSON.parse(match);


    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = '{}';
    if (this.displayedColumns && this.displayedColumns.length > 0) {
        project = '{';
        for (let i = 0; i < this.displayedColumns.length; i++) {
            let field = this.displayedColumns[i];
            project += `"${field}":{"$cond":[{"$eq":[{"$type":"$${field}"},"date"]},{"$dateToString":{"date":"$${field}","format":"%d/%m/%Y","timezone":"-03:00"}},{"$cond":[{"$ne":[{"$type":"$${field}"},"array"]},{"$toString":"$${field}"},"$${field}"]}]}`;
            if (i < this.displayedColumns.length - 1) {
                project += ',';
            }
        }
        project += '}';
    }
    project = JSON.parse(project);


    // AGRUPAMOS EL RESULTADO
    let group = {
        _id: null,
        count: { $sum: 1 },
        transactions: { $push: "$$ROOT" }
    };

    let page = 0;
    if(this.currentPage != 0) {
      page = this.currentPage - 1;
    }
    let skip = !isNaN(page * this.itemsPerPage) ?
            (page * this.itemsPerPage) :
                0 // SKIP

    this._transactionService.getTransactionsV2(
        project, // PROJECT
        match, // MATCH
        sortAux, // SORT
        group, // GROUP
        this.itemsPerPage, // LIMIT
        skip // SKIP
    ).subscribe(
      result => {
        if (result && result.transactions) {
            this.transactions = result.transactions;
            this.totalItems = result.count;
        } else {
            this.loading = false;
            this.transactions = null;
            this.totalItems = 0;
        }
        this.loading = false;
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
    this.getTransactions();
  }

  public orderBy(term: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-" + term;
    } else {
      this.orderTerm[0] = term;
    }

    this.getTransactions();
  }

  public openModal(op: string, transaction: Transaction): void {

    let modalRef;
    switch (op) {
      case 'view':
        modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg' });
        modalRef.componentInstance.transaction = transaction;
        break;
    }
  }


  public selectTransaction(transactionSelected: Transaction): void {
    
    this.transactionOrigin.push(transactionSelected);
    if (this.transactionDestination.type.requestArticles) {
      this.getMovementOfArticles(transactionSelected)
    } else {
      this.activeModal.close({ transactionsOrigin: this.transactionOrigin });
      //this.getMovementOfCashes(transactionSelected)
    }
    
    
    
  }

  public getMovementOfCashes(transaccion : Transaction ) {
    
    /*this._movementOfCashService.getMovementOfCashesByTransaction(transaccion._id).subscribe(
      result => {
        if (!result.movementsOfArticles) {
          
        } else {

          for (let index = 0; index < result.movementsOfArticles.length; index++) {
            
            let movementOfArticle = new MovementOfArticle();

            movementOfArticle.code = result.movementsOfArticles[index].code;
            movementOfArticle.article = result.movementsOfArticles[index].article;
            movementOfArticle.category = result.movementsOfArticles[index].category;
            movementOfArticle.amount = result.movementsOfArticles[index].amount;
            movementOfArticle.basePrice = result.movementsOfArticles[index].basePrice;
            movementOfArticle.costPrice = result.movementsOfArticles[index].costPrice;
            movementOfArticle.description = result.movementsOfArticles[index].description;
            movementOfArticle.markupPercentage = result.movementsOfArticles[index].markupPercentage;
            movementOfArticle.markupPrice = result.movementsOfArticles[index].markupPrice;
            movementOfArticle.printed = result.movementsOfArticles[index].printed;
            movementOfArticle.quantityMeasure = result.movementsOfArticles[index].quantityMeasure;
            movementOfArticle.roundingAmount = result.movementsOfArticles[index].roundingAmount;
            movementOfArticle.salePrice = result.movementsOfArticles[index].salePrice;
            movementOfArticle.transactionDiscountAmount = result.movementsOfArticles[index].transactionDiscountAmount;
            movementOfArticle.unitPrice = result.movementsOfArticles[index].unitPrice;
            movementOfArticle.transaction = this.transactionDestination;

            

            this.movementOfarticles.push(movementOfArticle)
            
          }

          this.saveMovementsOfArticles()

        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );*/
  }

  public saveMovementOfCashes( transaccion : Transaction) {
    
    /*this.loading = true;

    this._movementOfCashService.saveMovementsOfCashes(this.movementsOfCashesToFinance).subscribe(
      result => {
        if (!result.movementsOfCashes) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.getMovementOfCashesByTransaction();
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );*/
  }

  public getMovementOfArticles( transaccion : Transaction) {


    this._movementOfArticleService.getMovementsOfTransaction(transaccion._id).subscribe(
      result => {
        if (!result.movementsOfArticles) {
          
        } else {

          for (let index = 0; index < result.movementsOfArticles.length; index++) {
            
            let movementOfArticle = new MovementOfArticle();

            movementOfArticle.code = result.movementsOfArticles[index].code;
            movementOfArticle.article = result.movementsOfArticles[index].article;
            movementOfArticle.category = result.movementsOfArticles[index].category;
            movementOfArticle.amount = result.movementsOfArticles[index].amount;
            movementOfArticle.basePrice = result.movementsOfArticles[index].basePrice;
            movementOfArticle.costPrice = result.movementsOfArticles[index].costPrice;
            movementOfArticle.description = result.movementsOfArticles[index].description;
            movementOfArticle.markupPercentage = result.movementsOfArticles[index].markupPercentage;
            movementOfArticle.markupPrice = result.movementsOfArticles[index].markupPrice;
            movementOfArticle.printed = result.movementsOfArticles[index].printed;
            movementOfArticle.quantityMeasure = result.movementsOfArticles[index].quantityMeasure;
            movementOfArticle.roundingAmount = result.movementsOfArticles[index].roundingAmount;
            movementOfArticle.salePrice = result.movementsOfArticles[index].salePrice;
            movementOfArticle.transactionDiscountAmount = result.movementsOfArticles[index].transactionDiscountAmount;
            movementOfArticle.unitPrice = result.movementsOfArticles[index].unitPrice;
            movementOfArticle.transaction = this.transactionDestination;

            

            this.movementOfarticles.push(movementOfArticle)
            
          }

          this.saveMovementsOfArticles()

        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );

  }

  public saveMovementsOfArticles() {

    this._movementOfArticleService.saveMovementsOfArticles(this.movementOfarticles).subscribe(
      result => {
        if (!result.movementsOfArticles) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
         

          this.activeModal.close({ transactionsOrigin: this.transactionOrigin });
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
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
