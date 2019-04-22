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
import { RoundNumberPipe } from 'app/pipes/round-number.pipe';
import { ArticleFields } from 'app/models/article-fields';
import { ArticleFieldType } from 'app/models/article-field';
import { Taxes } from 'app/models/taxes';
import { Config } from 'app/app.config';
import { MovementOfCancellation } from 'app/models/movement-of-cancellation';

@Component({
  selector: 'app-movement-of-cancellation',
  templateUrl: './movement-of-cancellation.component.html',
  styleUrls: ['./movement-of-cancellation.component.css']
})

export class MovementOfCancellationComponent implements OnInit {

  @Input() transaccionDestinationId: string;
  @Input() transaccionDestinationViewId: string;
  @Input() transaccionOriginViewId : string;
  public transactionDestination: Transaction;
  public transactionMovement: TransactionMovement;
  public movementsOfCancellations: MovementOfCancellation[];
  public transactions: Transaction[];
  public cancellationTypes : CancellationType[];
  public alertMessage: string = '';
  public loading: boolean = false;
  public totalItems: number = -1;
  public orderTerm: string[] = ['-endDate'];
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
  public roundNumber = new RoundNumberPipe();
  public userCountry: string;
  public balanceSelected: number = 0;

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
    this.userCountry = Config.country;
    this.filters = new Array();
    for(let field of this.displayedColumns) {
      this.filters[field] = "";
    }
    this.existingCanceled = new Array();
    this.transactions = new Array();
    this.movementsOfCancellations = new Array();
  }

  async ngOnInit() {

    if(this.transaccionDestinationViewId || this.transaccionOriginViewId) {
      this.getCancellationsOfMovements();
    } else {
      this.transactionDestination = await this.getTransaction(this.transaccionDestinationId);
      if(this.transactionDestination) {
        this.getCancellationTypes();
      }
    }
  }

  public getCancellationsOfMovements() {
    
    this.loading = true;

    // ORDENAMOS LA CONSULTA
    let sortAux = { order: 1 };

    let match;
    // FILTRAMOS LA CONSULTA
    if(this.transaccionOriginViewId) {
      match = { "transactionOrigin": { $oid: this.transaccionOriginViewId} , "operationType": { "$ne": "D" } };
    } else {
      match = { "transactionDestination": { $oid: this.transaccionDestinationViewId} , "operationType": { "$ne": "D" } };
    }
    
    // CAMPOS A TRAER
    let project = {
      "transactionOrigin": 1,
      "transactionDestination": 1,
      "operationType" : 1
    };

    // AGRUPAMOS EL RESULTADO
    let group = {};

    let limit = 0;

    let skip = 0;

    this._movementOfCancellation.getMovementsOfCancellations(
      project, // PROJECT
      match, // MATCH
      sortAux, // SORT
      group, // GROUP
      limit, // LIMIT
      skip // SKIP
    ).subscribe(async result => {
      if (result && result.movementsOfCancellations && result.movementsOfCancellations.length > 0) {
        for (let index = 0; index < result.movementsOfCancellations.length; index++) {
          let transaction = new Transaction;
          if(this.transaccionOriginViewId){
            transaction = await this.getTransaction(result.movementsOfCancellations[index].transactionDestination)
          } else {
            transaction = await this.getTransaction(result.movementsOfCancellations[index].transactionOrigin)
          }
          if(transaction){
            this.transactions.push(transaction);
          } else {
            this.showMessage("No se encontraron transacciones relacionadas", 'danger', false);
            this.totalItems = 0;
            this.loading = false;
          }
        }
      } else {
        this.showMessage("No se encontraron transacciones relacionadas", 'danger', false);
        this.totalItems = 0;
        this.loading = false;
      }
      this.loading = false;
    },
    error => {
      this.showMessage(error._body, 'danger', false);
      this.totalItems = 0;
      this.loading = false;
    });
  }
  

  public getTransaction(transactionId: string): Promise<Transaction> {
    
    return new Promise<Transaction>((resolve, reject) => {

      this.loading = true;

      this._transactionService.getTransaction(transactionId).subscribe(
        result => {
          if (!result.transaction) {
            this.showMessage(result.message, 'danger', false);
            this.totalItems = 0;
            this.loading = false;
            resolve(null);
          } else {
            this.hideMessage();
            this.loading = false;
            resolve(result.transaction);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.totalItems = 0;
          this.loading = false;
          resolve(null);
        }
      );
    });
  }

  public getCancellationTypes() : void {

    this.loading = true;

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
      if (result && result.cancellationTypes && result.cancellationTypes.length > 0) {
        this.cancellationTypes = result.cancellationTypes;
        this.getTransactions();
      } else {
        this.totalItems = 0;
      }
      this.loading = false;
    },
    error => {
      this.showMessage(error._body, 'danger', false);
      this.totalItems = 0;
      this.loading = false;
    });
  }

  public getTransactions() {
    
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

    let skip = 0; // SKIP
    let limit = 0; // LIMIT

    this._transactionService.getTransactionsV2(
        project, // PROJECT
        match, // MATCH
        sortAux, // SORT
        group, // GROUP
        limit, // LIMIT
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
        modalRef.componentInstance.transactionId = transaction._id;
        break;
    }
  }

  async selectTransaction(transactionSelected: Transaction) {
    
    transactionSelected = await this.getTransaction(transactionSelected._id);
    if(this.isTransactionSelected(transactionSelected)) {
      this.deleteTransactionSelected(transactionSelected);
    } else {
      let movementOfCancellation = new MovementOfCancellation();
      movementOfCancellation.transactionOrigin = transactionSelected;
      movementOfCancellation.transactionDestination = this.transactionDestination;
      movementOfCancellation.balance = transactionSelected.balance;
      this.balanceSelected += movementOfCancellation.balance;
      this.movementsOfCancellations.push(movementOfCancellation);
    }
  }

  public deleteTransactionSelected(transaction: Transaction): void {
    
    let movementToDelete: number;

    for(let i=0; i < this.movementsOfCancellations.length; i++) {
      if(this.movementsOfCancellations[i].transactionOrigin._id.toString() === transaction._id.toString()) {
        movementToDelete = i;
      }
    }
    if(movementToDelete !== undefined) {
      this.balanceSelected -= this.movementsOfCancellations[movementToDelete].balance;
      this.movementsOfCancellations.splice(movementToDelete, 1);
    }
  }

  public isTransactionSelected(transaction: Transaction) {
    
    let isSelected: boolean = false;

    for(let mov of this.movementsOfCancellations) {
      if(mov.transactionOrigin._id.toString() === transaction._id.toString()) {
        isSelected = true;
      }
    }

    return isSelected;
  }

  async finish() {

    let endedProcess = true;

    if(this.movementsOfCancellations.length > 0) {
      for(let mov of this.movementsOfCancellations) {
        if(mov.balance > 0) {
          if(mov.balance <= mov.transactionOrigin.balance) {
            await this.getMovementOfArticles(mov.transactionOrigin).then(
              async movementsOfArticles => {
                if(movementsOfArticles && movementsOfArticles.length > 0) {
                  await this.saveMovementsOfArticles(movementsOfArticles).then(
                    movementsOfArticlesSaved => {
                      if(movementsOfArticlesSaved && movementsOfArticlesSaved.length > 0) {
    
                      } else {
                        endedProcess = false;
                      }
                    }
                  );
                }
              }
            );
          } else {
            endedProcess = false;
            this.showMessage("El saldo ingresado en la transacción " + mov.transactionOrigin.type.name + " " + mov.transactionOrigin.number + " no puede ser mayor que el saldo restante de la misma ($ " + mov.transactionOrigin.balance + ").", "info", true);
          }
        } else {
          endedProcess = false;
          this.showMessage("El saldo ingresado en la transacción " + mov.transactionOrigin.type.name + " " + mov.transactionOrigin.number + " debe ser mayor a 0.", "info", true);
        }
      }
      if(endedProcess) {
        this.closeModal();
      }
    } else {  
      this.closeModal();
    }
  }

  public getMovementOfArticles(transaccion : Transaction): Promise<MovementOfArticle[]> {

    return new Promise((resolve, reject) => {

      this._movementOfArticleService.getMovementsOfTransaction(transaccion._id).subscribe(
        result => {
          if (!result.movementsOfArticles) {
            resolve(null);
          } else {
            let movements: MovementOfArticle[] = new Array(); 

            for (let mov of result.movementsOfArticles) {
              
              let movementOfArticle = new MovementOfArticle();

              movementOfArticle.code = mov.code;
              movementOfArticle.codeSAT = mov.codeSAT;
              movementOfArticle.description = mov.description;
              movementOfArticle.observation = mov.observation;
              movementOfArticle.otherFields = mov.otherFields;
              movementOfArticle.basePrice = mov.basePrice;
              if(this.transactionDestination.type.requestTaxes) {
                movementOfArticle.taxes = mov.taxes;
              }
              movementOfArticle.costPrice = mov.costPrice;
              movementOfArticle.unitPrice = mov.unitPrice;
              movementOfArticle.markupPercentage = mov.markupPercentage;
              movementOfArticle.markupPrice = mov.markupPrice;
              // movementOfArticle.transactionDiscountAmount = mov.transactionDiscountAmount; SE QUITA DESCUENTO DE TRANSACCION
              movementOfArticle.salePrice = mov.salePrice;
              movementOfArticle.roundingAmount = mov.roundingAmount;
              movementOfArticle.make = mov.make;
              movementOfArticle.category = mov.category;
              movementOfArticle.amount = mov.amount;
              movementOfArticle.quantityForStock = mov.quantityForStock;
              movementOfArticle.barcode = mov.barcode;
              movementOfArticle.notes = mov.notes;
              movementOfArticle.printed = mov.printed;
              movementOfArticle.printIn = mov.printIn;
              movementOfArticle.article = mov.article;
              movementOfArticle.transaction = this.transactionDestination;
              movementOfArticle.measure = mov.measure;
              movementOfArticle.quantityMeasure = mov.quantityMeasure;
              if (movementOfArticle.transaction.type.transactionMovement === TransactionMovement.Sale) {
                movementOfArticle = this.recalculateSalePrice(movementOfArticle);
              } else {
                movementOfArticle = this.recalculateCostPrice(movementOfArticle);
              }

              movements.push(movementOfArticle);
            }
            resolve(movements);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public recalculateCostPrice(movementOfArticle: MovementOfArticle): MovementOfArticle {

    let quotation = 1;
    
    if(movementOfArticle.transaction.quotation) {
      quotation = movementOfArticle.transaction.quotation;
    }
    
    // ADVERTENCIA, EL UNIT PRICE NO SE RECALCULA CON EL DESCUENTO DE LA TRANSACCION PARA QUE EL DESCUENTO DE LA TRANSACCION CANCELADA PASE A LA TRANSACCION CANCELATORIA
    movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.unitPrice * movementOfArticle.amount);
    movementOfArticle.markupPrice = 0.00;
    movementOfArticle.markupPercentage = 0.00;

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
    if (movementOfArticle.transaction.type.requestTaxes) {
      if (movementOfArticle.article && movementOfArticle.article.taxes && movementOfArticle.article.taxes.length > 0) {
        let taxes: Taxes[] = new Array();
        for (let articleTax of movementOfArticle.article.taxes) {
          articleTax.taxBase = taxedAmount;
          articleTax.taxAmount = this.roundNumber.transform((articleTax.taxBase * articleTax.percentage / 100));
          taxes.push(articleTax);
          movementOfArticle.costPrice += articleTax.taxAmount;
        }
        movementOfArticle.taxes = taxes;
      }
    }
    movementOfArticle.costPrice += this.roundNumber.transform(taxedAmount);
    movementOfArticle.salePrice = movementOfArticle.costPrice + movementOfArticle.roundingAmount;

    return movementOfArticle;
  }

  // EL IMPUESTO VA SOBRE EL ARTICULO Y NO SOBRE EL MOVIMIENTO
  public recalculateSalePrice(movementOfArticle: MovementOfArticle): MovementOfArticle {

    let quotation = 1;
    if(this.transactionDestination.quotation) {
      quotation = this.transactionDestination.quotation;
    }

    if (movementOfArticle.article) {

      movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.article.basePrice * movementOfArticle.amount);

      if( movementOfArticle.article.currency &&  
        Config.currency && 
        Config.currency._id !== movementOfArticle.article.currency._id) {
          movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.basePrice * quotation);
      }
    }

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

    if (movementOfArticle.article) {
      movementOfArticle.costPrice = this.roundNumber.transform(movementOfArticle.article.costPrice * movementOfArticle.amount);

      if( movementOfArticle.article.currency &&  
        Config.currency && 
        Config.currency._id !== movementOfArticle.article.currency._id) {
          movementOfArticle.costPrice = this.roundNumber.transform(movementOfArticle.costPrice * quotation);
      }
    }
    

    // ADVERTENCIA, EL UNIT PRICE NO SE RECALCULA CON EL DESCUENTO DE LA TRANSACCION PARA QUE EL DESCUENTO DE LA TRANSACCION CANCELADA PASE A LA TRANSACCION CANCELATORIA
    movementOfArticle.salePrice = this.roundNumber.transform(movementOfArticle.unitPrice * movementOfArticle.amount);
    movementOfArticle.markupPrice = this.roundNumber.transform(movementOfArticle.salePrice - movementOfArticle.costPrice);
    movementOfArticle.markupPercentage = this.roundNumber.transform((movementOfArticle.markupPrice / movementOfArticle.costPrice * 100), 3);

    if (movementOfArticle.transaction.type.requestTaxes) {
      let tax: Taxes = new Taxes();
      let taxes: Taxes[] = new Array();
      if (movementOfArticle.article && movementOfArticle.article.taxes && movementOfArticle.article.taxes.length > 0) {
        for (let taxAux of movementOfArticle.article.taxes) {
          tax.percentage = this.roundNumber.transform(taxAux.percentage);
          tax.tax = taxAux.tax;
          tax.taxBase = this.roundNumber.transform((movementOfArticle.salePrice / ((tax.percentage / 100) + 1)));
          tax.taxAmount = this.roundNumber.transform((tax.taxBase * tax.percentage / 100));
          taxes.push(tax);
        }
      }
      movementOfArticle.taxes = taxes;
    }

    return movementOfArticle;
  }

  public refresh(): void {
    this.getCancellationTypes();
  }

  public closeModal(): void {
    this.activeModal.close(
      {
        movementsOfCancellations: this.movementsOfCancellations
      }
    );
  }

  public updateBalanceOrigin(transaction: Transaction, balance): void {

    this.balanceSelected = 0;

    if(balance === undefined) {
      balance = 0;
    } else {
      try {
        balance = parseFloat(balance.toString());
      } catch (err) {
        balance = 0;
      }
    }

    for(let mov of this.movementsOfCancellations) {
      if(mov.transactionOrigin._id.toString() === transaction._id.toString()) {
        mov.balance = balance;
      }
      this.balanceSelected += mov.balance;
    }
  }

  public saveMovementsOfArticles(movemenstOfarticles: MovementOfArticle[]): Promise<MovementOfArticle[]> {

    return new Promise((resolve, reject) => {

      this._movementOfArticleService.saveMovementsOfArticles(movemenstOfarticles).subscribe(
        result => {
          if (!result.movementsOfArticles) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.movementsOfArticles);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
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
