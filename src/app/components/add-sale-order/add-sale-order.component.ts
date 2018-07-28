//Paquetes Angular
import { Component, OnInit, ElementRef, ViewChild, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

//Paquetes de terceros
import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

//Modelos
import { Transaction, TransactionState } from './../../models/transaction';
import { TransactionMovement, StockMovement } from './../../models/transaction-type';
import { Taxes } from './../../models/taxes';
import { ArticlePrintIn, Article } from './../../models/article';
import { ArticleStock } from './../../models/article-stock';
import { MovementOfArticle } from './../../models/movement-of-article';
import { Table, TableState } from './../../models/table';
import { Employee } from './../../models/employee';
import { Category } from './../../models/category';
import { Print } from './../../models/print';
import { Printer, PrinterType, PrinterPrintIn } from './../../models/printer';
import { Config } from './../../app.config';
import { CompanyType } from '../../models/company';

//Servicios
import { MovementOfArticleService } from './../../services/movement-of-article.service';
import { TransactionService } from './../../services/transaction.service';
import { TransactionTypeService } from './../../services/transaction-type.service';
import { TableService } from './../../services/table.service';
import { TurnService } from './../../services/turn.service';
import { PrinterService } from './../../services/printer.service';
import { UserService } from './../../services/user.service';
import { PrintService } from './../../services/print.service';
import { ArticleStockService } from '../../services/article-stock.service';
import { TaxService } from '../../services/tax.service';

//Componentes
import { ListCompaniesComponent } from './../list-companies/list-companies.component';
import { AddMovementOfArticleComponent } from './../add-movement-of-article/add-movement-of-article.component';
import { SelectEmployeeComponent } from './../select-employee/select-employee.component';
import { PrintComponent } from './../../components/print/print.component';
import { DeleteTransactionComponent } from '../delete-transaction/delete-transaction.component';
import { AddMovementOfCashComponent } from '../add-movement-of-cash/add-movement-of-cash.component';
import { ApplyDiscountComponent } from '../apply-discount/apply-discount.component';

//Pipes
import { DateFormatPipe } from './../../pipes/date-format.pipe';
import { RoundNumberPipe } from './../../pipes/round-number.pipe';

@Component({
  selector: 'app-add-sale-order',
  templateUrl: './add-sale-order.component.html',
  styleUrls: ['./add-sale-order.component.css'],
  providers: [NgbAlertConfig, DateFormatPipe, RoundNumberPipe]
})

export class AddSaleOrderComponent implements OnInit {

  public transaction: Transaction;
  public transactionMovement: string;
  public alertMessage: string = "";
  public movementsOfArticles: MovementOfArticle[];
  public printers: Printer[];
  public printerSelected: Printer;
  public printersAux: Printer[];  //Variable utilizada para guardar las impresoras de una operación determinada (Cocina, mostrador, Bar)
  public paymentForm: FormGroup;
  public userType: string;
  public posType: string;
  public table: Table; //Solo se usa si posType es igual a resto
  public loading: boolean = false;
  public areCategoriesVisible: boolean = true;
  public areArticlesVisible: boolean = false;
  public categorySelected: Category;
  @ViewChild('contentPrinters') contentPrinters: ElementRef;
  @ViewChild('contentMessage') contentMessage: ElementRef;
  public paymentAmount: number = 0.00;
  public typeOfOperationToPrint: string;
  public kitchenArticlesToPrint: MovementOfArticle[];
  public barArticlesToPrint: MovementOfArticle[];
  public printSelected: Print;
  public filterArticle: string;
  public focusEvent = new EventEmitter<boolean>();
  public roundNumber = new RoundNumberPipe();
  public amountModifyStock = 0; //Saber cuando termina de actualizar el stock
  public areMovementsOfArticlesEmpty: boolean = true;
  public apiURL = Config.apiURL;

  constructor(
    public _fb: FormBuilder,
    public _transactionService: TransactionService,
    public _transactionTypeService: TransactionTypeService,
    public _movementOfArticleService: MovementOfArticleService,
    public _articleStockService: ArticleStockService,
    public _tableService: TableService,
    public _turnService: TurnService,
    public _printService: PrintService,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal,
    public _printerService: PrinterService,
    public _userService: UserService,
    private cdref: ChangeDetectorRef,
    private _taxService: TaxService
  ) {
    this.transaction = new Transaction();
    this.movementsOfArticles = new Array();
    this.categorySelected = new Category();
    this.printers = new Array();
    this.printersAux = new Array();
    this.barArticlesToPrint = new Array();
    this.kitchenArticlesToPrint = new Array();
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.posType = pathLocation[2];
    let op = pathLocation[3];
    this.getPrinters();
    
    if (this.posType === "resto") {
      this.table = new Table();
      this.transaction.table = this.table;
      let tableId = pathLocation[6];
      if (tableId) {
        this.getOpenTransactionByTable(tableId);
      } else {
        this.showMessage("No se ha seleccionado ninguna mesa", "info", false);
      }
    } else {
      if (op === "agregar-transaccion") {
        let transactionTypeID = pathLocation[4];
        this.getTransactionType(transactionTypeID);
      } else if(op = "editar-transaccion") {
        let transactionId = pathLocation[4];
        this.getTransaction(transactionId);
      }
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getTransactionType(transactionTypeID: string): void {
    
    this.loading = true;
    
    this._transactionTypeService.getTransactionType(transactionTypeID).subscribe(
      result => {
        if (!result.transactionType) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          this.transaction.type = result.transactionType;
          this.transactionMovement = ""+this.transaction.type.transactionMovement;
          this.getLastTransactionByType();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getLastTransactionByType(): void {

    this.loading = true;

    this._transactionService.getLastTransactionByTypeAndOrigin(this.transaction.type, 0, this.transaction.letter).subscribe(
      result => {
        if (!result.transactions) {
          this.transaction.origin = 0;
          this.transaction.number = 1;
          this.addTransaction();
        } else {
          this.transaction.origin = result.transactions[0].origin;
          this.transaction.number = result.transactions[0].number + 1;
          this.addTransaction();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public changeVisibilityArticle(): void {
    if (this.filterArticle !== "" && this.filterArticle !== undefined) {
      this.areArticlesVisible = true;
      this.areCategoriesVisible = false;
    } else {
      this.areArticlesVisible = false;
      this.areCategoriesVisible = true;
    }
    this.cdref.detectChanges();
  }

  public getPrinters(): void {

    this.loading = true;

    this._printerService.getPrinters().subscribe(
      result => {
        if (!result.printers) {
          this.printers = undefined;
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

  public getOpenTransactionByTable(tableId): void {

    this.loading = true;

    this._transactionService.getOpenTransactionByTable(tableId).subscribe(
      result => {
        if (!result.transactions) {
          this.hideMessage();
          this.getTable(tableId);
        } else {
          this.hideMessage();
          this.transaction = result.transactions[0];
          this.transactionMovement = ""+this.transaction.type.transactionMovement;
          this.table = this.transaction.table;
          this.getMovementsOfTransaction();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getTransaction(transactionId): void {

    this.loading = true;

    this._transactionService.getTransaction(transactionId).subscribe(
      result => {
        if (!result.transaction) {
          this.showMessage(result.message, "danger", false);
          this.loading = false;
        } else {
          this.hideMessage();
          this.transaction = result.transaction;
          this.transactionMovement = "" + this.transaction.type.transactionMovement;
          this.getMovementsOfTransaction();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getTable(id: string): void {

    this.loading = true;

    this._tableService.getTable(id).subscribe(
      result => {
        if (!result.table) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          this.hideMessage();
          this.table = result.table;
          this.transaction.table = this.table;
          this.transaction.diners = this.table.diners;
          this.transaction.employeeOpening = this.table.employee;
          this.transaction.employeeClosing = this.table.employee;
          this.getOpenTurn(this.table.employee);
          this.getDefectOrder();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getDefectOrder(): void {

    this.loading = true;

    this._transactionTypeService.getDefectOrder().subscribe(
      result => {
        if (!result.transactionTypes) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          this.transaction.type = result.transactionTypes[0];
          this.transactionMovement = "" + this.transaction.type.transactionMovement;
          this.getLastTransactionByType();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getOpenTurn(employee: Employee): void {

    this.loading = true;

    this._turnService.getOpenTurn(employee._id).subscribe(
      result => {
        if (!result.turns) {
          this.openModal("change-employee");
        } else {
          this.transaction.turnOpening = result.turns[0];
          this.transaction.turnClosing = result.turns[0];
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public addTransaction(): void {

    this.loading = true;
    this.transaction.madein = this.posType;
    
    this._transactionService.saveTransaction(this.transaction).subscribe(
      result => {
        if (!result.transaction) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          this.hideMessage();
          this.transaction = result.transaction;
          if (this.posType === "resto") {
            this.changeStateOfTable(TableState.Busy, false);
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public updateTransaction(closed: boolean = false): void {

    this.loading = true;
    
    this._transactionService.updateTransaction(this.transaction).subscribe(
      result => {
        if (!result.transaction) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          //No anulamos el mensaje para que figuren en el pos, si es que da otro error.
          if (closed) {
            this.backFinal();
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public showArticlesOfCategory(category: Category): void {

    this.categorySelected = category;
    this.areArticlesVisible = true;
    this.areCategoriesVisible = false;
  }

  public close() {

    this.typeOfOperationToPrint = 'item';
    
    for (let movementOfArticle of this.movementsOfArticles) {
      if (movementOfArticle.printIn === ArticlePrintIn.Bar && movementOfArticle.printed < movementOfArticle.amount) {
        this.barArticlesToPrint.push(movementOfArticle);
      }

      if (movementOfArticle.printIn === ArticlePrintIn.Kitchen && movementOfArticle.printed < movementOfArticle.amount) {
        this.kitchenArticlesToPrint.push(movementOfArticle);
      }
    }

    if (this.barArticlesToPrint.length !== 0) {
      this.typeOfOperationToPrint = "bar";
      this.openModal('printers');
    }

    if (this.kitchenArticlesToPrint.length !== 0 && this.barArticlesToPrint.length === 0) {
      this.typeOfOperationToPrint = "kitchen";
      this.openModal('printers');
    }

    if (this.barArticlesToPrint.length === 0 && this.kitchenArticlesToPrint.length === 0) {
      if (this.posType === "resto") {
        this.changeStateOfTable(TableState.Busy, true);
      } else {
        this.backFinal();
      }
    }
  }

  public changeStateOfTable(state: any, closed: boolean): void {

    this.loading = true;

    this.table.state = state;
    this._tableService.updateTable(this.table).subscribe(
      result => {
        if (!result.table) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          this.table = result.table;
          if (closed) {
            this.backFinal();
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public updateTable(): void {

    this.loading = true;

    this._tableService.updateTable(this.table).subscribe(
      result => {
        if (!result.table) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          this.table = result.table;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public addItem(itemData: MovementOfArticle): void {
    

    if(this.filterArticle && this.filterArticle !== "") {
      this.filterArticle = "";
    }

    if(!itemData.article.containsVariants) {

      let movementOfArticle: MovementOfArticle = this.getMovementOfArticleByArticle(itemData.article._id);
      
      if (!movementOfArticle) {
        movementOfArticle = itemData;
        movementOfArticle.transaction = this.transaction;
        if (Config.modules.stock &&
            this.transaction.type.modifyStock) {
          this.getArticleStock("save", movementOfArticle);
        } else {
          this.verifyPermissions("save", movementOfArticle, null);
        }
      } else {
        if (Config.modules.stock &&
            this.transaction.type.modifyStock) {
          this.getArticleStock("update", movementOfArticle);
        } else {
          this.verifyPermissions("update", movementOfArticle, null);
        }
      }
    } else {
      let movementOfArticle: MovementOfArticle;
      movementOfArticle = itemData;
      movementOfArticle._id = "";
      movementOfArticle.transaction = this.transaction;
      movementOfArticle.printed = 0;
      movementOfArticle.amount = 1;
      this.openModal("movement_of_article", movementOfArticle);
    }
  }

  public getArticleStock(op: string, movementOfArticle: MovementOfArticle): void {
    
    this.loading = true;

    this._articleStockService.getStockByArticle(movementOfArticle.article._id).subscribe(
      result => {
        if (!result.articleStocks || result.articleStocks.length <= 0) {
          this.loading = false;
          this.verifyPermissions(op, movementOfArticle, null);
        } else {
          this.loading = false;
          let articleStock = result.articleStocks[0];
          this.verifyPermissions(op, movementOfArticle, articleStock);
        }
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public verifyPermissions(op: string, movementOfArticle: MovementOfArticle, articleStock: ArticleStock): void {
    
    let allowed = true;

    if (this.transaction.type.transactionMovement === TransactionMovement.Sale &&
      !movementOfArticle.article.allowSale) {
      allowed = false;
      this.showMessage("El artículo no esta habilitado para la venta", "info", true);
    }

    if (this.transaction.type.transactionMovement === TransactionMovement.Purchase &&
      !movementOfArticle.article.allowPurchase) {
      allowed = false;
      this.showMessage("El artículo no esta habilitado para la compra", "info", true);
    }

    if (Config.modules.stock &&
        this.transaction.type.transactionMovement === TransactionMovement.Sale &&
        this.transaction.type.modifyStock &&
        !movementOfArticle.article.allowSaleWithoutStock &&
        (!articleStock || ((articleStock && movementOfArticle.amount + 1) > articleStock.realStock))) {
      allowed = false;
      this.showMessage("No tiene el stock suficiente para vender la cantidad solicitada.", "info", true);
    }
    
    if (allowed) {
      if (op === "save") {
        movementOfArticle._id = "";
        movementOfArticle.printed = 0;
        movementOfArticle.transaction = this.transaction;
        movementOfArticle.amount = 1;
        this.saveMovementOfArticle(movementOfArticle);
      } else if (op === "update") {
        movementOfArticle.amount += 1;
        movementOfArticle.basePrice += movementOfArticle.article.basePrice;
        movementOfArticle.costPrice += movementOfArticle.article.costPrice;
        movementOfArticle.markupPrice += movementOfArticle.article.markupPrice;
        movementOfArticle.salePrice += movementOfArticle.article.salePrice;
        let tax: Taxes = new Taxes();
        let taxes: Taxes[] = new Array();
        if (movementOfArticle.article && movementOfArticle.article.taxes && movementOfArticle.article.taxes.length > 0) {
          for (let taxAux of movementOfArticle.article.taxes) {
            tax.percentage = this.roundNumber.transform(taxAux.percentage);
            tax.tax = taxAux.tax;
            tax.taxBase = this.roundNumber.transform(movementOfArticle.salePrice / ((tax.percentage / 100) + 1));
            tax.taxAmount = this.roundNumber.transform(tax.taxBase * tax.percentage / 100);
            taxes.push(tax);
          }
        }
        movementOfArticle.taxes = taxes;
        this.updateMovementOfArticle(movementOfArticle);
      }
    }
  }

  public getMovementOfArticleByArticle(articleId: string): MovementOfArticle {
    
    let movementOfArticle: MovementOfArticle;
    
    if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {
      for(let movementOfArticleAux of this.movementsOfArticles) {
        if (movementOfArticleAux.article._id === articleId) {
          movementOfArticle = movementOfArticleAux;
        }
      }
    }

    return movementOfArticle;
  }

  public updateMovementOfArticle(movementOfArticle: MovementOfArticle, get: boolean = true) {

    this.loading = true;

    this._movementOfArticleService.updateMovementOfArticle(movementOfArticle).subscribe(
      result => {
        if (!result.movementOfArticle) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          if(get) {
            this.getMovementsOfTransaction();
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public cleanFilterArticle(): void {
    this.filterArticle = "";
    this.areArticlesVisible = false;
    this.areCategoriesVisible = true;
  }

  public updateTaxes(): void {

    let transactionTaxes: Taxes[] = new Array();
    let transactionTaxesAUX: Taxes[] = new Array();

    for (let movementOfArticle of this.movementsOfArticles) {

      if (movementOfArticle.taxes && movementOfArticle.taxes.length !== 0) {

        let transactionTax: Taxes = new Taxes();
        for(let taxesAux of movementOfArticle.taxes) {
          if(this.transaction.type.transactionMovement === TransactionMovement.Sale) {
            transactionTax.percentage = this.roundNumber.transform(taxesAux.percentage);
            transactionTax.tax = taxesAux.tax;
            transactionTax.taxBase = this.roundNumber.transform(taxesAux.taxBase);
            transactionTax.taxAmount = this.roundNumber.transform(taxesAux.taxAmount);
          } else {
            transactionTax = taxesAux;
          }
        }
        transactionTaxesAUX.push(transactionTax);
      } else {
        this.transaction.exempt += movementOfArticle.salePrice;
      }
    }

    for (let transactionTaxAux of transactionTaxesAUX) {
      let exists: boolean = false;
      for(let transactionTax of transactionTaxes) {
        if(transactionTaxAux.tax._id === transactionTax.tax._id &&
          transactionTaxAux.percentage === transactionTax.percentage) {
          transactionTax.taxAmount += transactionTaxAux.taxAmount;
          transactionTax.taxBase += transactionTaxAux.taxBase;
          exists = true;
        }
      }

      if(!exists) {
        transactionTaxes.push(transactionTaxAux);
      }
    }

    this.transaction.taxes = transactionTaxes;
    this.updateTransaction();
  }

  public updateDiscounts(): void {

    let percentage = this.transaction.discountPercent;

    if (percentage > 0) {
      for (let movementOfArticle of this.movementsOfArticles) {
        movementOfArticle.salePrice = this.roundNumber.transform((movementOfArticle.article.salePrice - (movementOfArticle.article.salePrice * percentage / 100)) * movementOfArticle.amount);
        movementOfArticle.markupPrice = this.roundNumber.transform((movementOfArticle.salePrice - movementOfArticle.costPrice), 3);
        movementOfArticle.markupPercentage = this.roundNumber.transform((movementOfArticle.markupPrice / movementOfArticle.article.costPrice * 100) / movementOfArticle.amount);
        let tax: Taxes = new Taxes();
        let taxes: Taxes[] = new Array();
        if (movementOfArticle.taxes) {
          for (let taxAux of movementOfArticle.taxes) {
            tax.percentage = this.roundNumber.transform(taxAux.percentage);
            tax.tax = taxAux.tax;
            tax.taxBase = this.roundNumber.transform(movementOfArticle.salePrice / ((tax.percentage / 100) + 1));
            tax.taxAmount = this.roundNumber.transform(tax.taxBase * tax.percentage / 100);
            taxes.push(tax);
          }
        }
        movementOfArticle.taxes = taxes;
        this.updateMovementOfArticle(movementOfArticle, false);
      }
    }
    
    this.updateTotalPrice();    
  }

  public validateElectronicTransaction(): void {
    
    
    
    this.showMessage("Validando comprobante con AFIP...", "info", false);

    this._transactionService.validateElectronicTransaction(this.transaction).subscribe(
      result => {
        if (result.status === 'err'){
          this.showMessage(result.code + " - " + result.message, "danger", false);
        } else {
          this.transaction.number = result.number;
          this.transaction.CAE = result.CAE;
          // this.transaction.CAEExpirationDate = moment(new Date(result.CAEExpirationDate)).format("YYYY-MM-DDTHH:mm:ssZ");
          this.transaction.state = TransactionState.Closed;
          if (Config.modules.stock &&
            this.transaction.type.modifyStock) {
            this.updateRealStock();
          } else {
            this.finish();
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage("Ha ocurrido un error en el servidor: " + error, "danger", false);
        this.loading = false;
      }
    )
  }

  public openModal(op: string, movementOfArticle?: MovementOfArticle): void {

    let modalRef;

    switch (op) {
      case 'movement_of_article':
        modalRef = this._modalService.open(AddMovementOfArticleComponent, { size: 'lg' });
        modalRef.componentInstance.movementOfArticle = movementOfArticle;
        modalRef.result.then((result) => {
          this.getMovementsOfTransaction();
        }, (reason) => {
          this.getMovementsOfTransaction();
        });
        break;
      case 'apply_discount':
        modalRef = this._modalService.open(ApplyDiscountComponent, { size: 'lg' });
        modalRef.componentInstance.amount = this.transaction.totalPrice;
        modalRef.componentInstance.amountToApply = this.transaction.discountAmount;
        modalRef.componentInstance.percentageToApply = this.transaction.discountPercent;
        modalRef.result.then((result) => {
          if(result.discount) {
            this.applyDiscount(
              result.discount.percentageToApply,
              result.discount.amountToApply
            );
          }
        }, (reason) => {
        });
       break;
      case 'cancel':
        modalRef = this._modalService.open(DeleteTransactionComponent, { size: 'lg' });
        modalRef.componentInstance.transaction = this.transaction;
        modalRef.result.then((result) => {
          if (result === 'delete_close') {
            if (this.posType === "resto") {
              this.table.employee = null;
              this.changeStateOfTable(TableState.Available, true);
            } else {
              this.backFinal();
            }
          }
        }, (reason) => {

        });
        break;
      case 'add_client':

        modalRef = this._modalService.open(ListCompaniesComponent, { size: 'lg' });
        if (this.transaction.type.transactionMovement === TransactionMovement.Purchase) {
          modalRef.componentInstance.type = CompanyType.Provider;
        } else if (this.transaction.type.transactionMovement === TransactionMovement.Sale) {
          modalRef.componentInstance.type = CompanyType.Client;
        }
        modalRef.result.then((result) => {
          if (result) {
            this.transaction.company = result;
            this.updateTransaction(false);
          }
        }, (reason) => {

        });
        break;
      case 'charge':

        this.typeOfOperationToPrint = "charge";
        
        if(this.isValidCharge()) {

          modalRef = this._modalService.open(AddMovementOfCashComponent, { size: 'lg' });
          modalRef.componentInstance.transaction = this.transaction;
          modalRef.result.then((result) => {

            let movementsOfCashes = result.movementsOfCashes;
            
            if (movementsOfCashes) {
              if (this.transaction.type.fixedOrigin && this.transaction.type.fixedOrigin !== 0) {
                this.transaction.origin = this.transaction.type.fixedOrigin;
              }

              this.assignLetter();

              if (this.transaction.type.electronics && !this.transaction.CAE) {
                this.validateElectronicTransaction();
              } else if (this.transaction.type.electronics && this.transaction.CAE) {
                this.finish(); //SE FINALIZA POR ERROR EN LA FE
              } else {
                this.assignTransactionNumber();
              }
            }
          }, (reason) => {
          });
        }
        break;
      case 'printers':
        if (this.countPrinters() > 1) {
          modalRef = this._modalService.open(this.contentPrinters, { size: 'lg' }).result.then((result) => {
            if (result !== "cancel" && result !== "") {
              this.distributeImpressions(result);
            }
          }, (reason) => {

          });
        } else if (this.countPrinters() === 1) {
          this.distributeImpressions(this.printersAux[0]);
        } else {
          this.backFinal();
        }
        break;
      case 'errorMessage':
        modalRef = this._modalService.open(this.contentMessage, { size: 'lg' }).result.then((result) => {
          if (result !== "cancel" && result !== "") {
            this.backFinal();
          }
        }, (reason) => {
        });
        break;
      case 'change-employee':
        modalRef = this._modalService.open(SelectEmployeeComponent);
        modalRef.componentInstance.requireLogin = true;
        modalRef.componentInstance.typeEmployee = "Mozo";
        modalRef.componentInstance.op = "change-employee";
        modalRef.result.then((result) => {
          if (result.employee) {
            this.transaction.turnClosing = result.turn;
            this.transaction.employeeClosing = result.employee;
            this.table.employee = result.employee;
            this.updateTransaction(false);
            this.updateTable();
          }
        }, (reason) => {

        });
        break;
      case 'print':
        modalRef = this._modalService.open(PrintComponent);
        modalRef.componentInstance.transaction = this.transaction;
        modalRef.componentInstance.company = this.transaction.company;
        modalRef.componentInstance.typePrint = 'invoice';
        modalRef.result.then((result) => {
        }, (reason) => {
          this.backFinal();
        });
        break;
      default: ;
    };
  }

  public finish(): void {

    this.transaction.endDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    this.transaction.expirationDate = this.transaction.endDate;
    this.transaction.state = TransactionState.Closed;
    this.updateTransaction(false);
    
    if (this.transaction.type.printable &&
      this.transaction.type.printable) {

      if (this.posType === "resto") {
        this.table.employee = null;
        this.changeStateOfTable(TableState.Available, false);
      }

      if (this.transaction.type.defectPrinter) {
        this.printerSelected = this.transaction.type.defectPrinter;
        this.distributeImpressions(this.transaction.type.defectPrinter);
      } else {
        this.openModal('printers');
      }
    } else {
      if (this.posType === "resto") {
        this.table.employee = null;
        this.changeStateOfTable(TableState.Available, true);
      } else {
        this.backFinal();
      }
    }
  }

  public getTaxVAT(movementOfArticle: MovementOfArticle): void {
    
    this.loading = true;

    let taxes: Taxes[] = new Array();
    let tax: Taxes = new Taxes();
    tax.percentage = 21.00;
    tax.taxBase = this.roundNumber.transform(movementOfArticle.salePrice / ((tax.percentage / 100) + 1));
    tax.taxAmount = this.roundNumber.transform(tax.taxBase * tax.percentage / 100);

    this._taxService.getTaxes('where="name":"IVA"').subscribe(
      result => {
        if (!result.taxes) {
          this.loading = false;
          this.showMessage("Debe configurar el impuesto IVA para el realizar el recargo de la tarjeta", "info", true);
        } else {
          this.hideMessage();
          tax.tax = result.taxes[0];
          taxes.push(tax);
          movementOfArticle.taxes = taxes;
          this.saveMovementOfArticle(movementOfArticle);
        }
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public applyDiscount(percentage: number, amount: number): void {

    for (let movementOfArticle of this.movementsOfArticles) {
      movementOfArticle.salePrice = this.roundNumber.transform((movementOfArticle.article.salePrice - (movementOfArticle.article.salePrice * percentage / 100)) * movementOfArticle.amount);
      movementOfArticle.markupPrice = this.roundNumber.transform((movementOfArticle.salePrice - movementOfArticle.costPrice), 3);
      movementOfArticle.markupPercentage = this.roundNumber.transform((movementOfArticle.markupPrice / movementOfArticle.article.costPrice * 100) / movementOfArticle.amount);
      let tax: Taxes = new Taxes();
      let taxes: Taxes[] = new Array();
      if (movementOfArticle.taxes) {
        for (let taxAux of movementOfArticle.taxes) {
          tax.percentage = this.roundNumber.transform(taxAux.percentage);
          tax.tax = taxAux.tax;
          tax.taxBase = this.roundNumber.transform(movementOfArticle.salePrice / ((tax.percentage / 100) + 1));
          tax.taxAmount = this.roundNumber.transform(tax.taxBase * tax.percentage / 100);
          taxes.push(tax);
        }
      }
      movementOfArticle.taxes = taxes;
      this.updateMovementOfArticle(movementOfArticle);
    }
    this.transaction.discountPercent = this.roundNumber.transform(percentage, 3);
    this.transaction.discountAmount = this.roundNumber.transform(amount, 3);
    
    this.updatePrices();
  }

  public isValidCharge(): boolean {

    let isValidCharge = true;

    if (this.movementsOfArticles.length <= 0) {
      isValidCharge = false;
      this.showMessage("No existen productos en la transacción.", "info", true);
    }

    if (isValidCharge &&
      this.transaction.type.transactionMovement === TransactionMovement.Purchase &&
      !this.transaction.company) {
      isValidCharge = false;
      this.showMessage("Debe seleccionar un proveedor para la transacción.", "info", true);
    }

    if (isValidCharge &&
      this.transaction.type.electronics &&
      this.transaction.totalPrice > 1000 &&
      !this.transaction.company) {
      isValidCharge = false;
      this.showMessage("Debe indentificar al cliente para documentos electrónicos con monto mayor a $1.000,00.", "info", true);
    }

    if (isValidCharge &&
        this.transaction.type.electronics &&
        this.transaction.company &&
        ((!this.transaction.company.CUIT || (this.transaction.company.CUIT && this.transaction.company.CUIT === "")) &&
        (!this.transaction.company.DNI || (this.transaction.company.DNI && this.transaction.company.DNI === "")))) {
      isValidCharge = false;
      this.showMessage("El cliente ingresado no tiene CUIT/DNI.", "info", true);
      this.loading = false;
    }

    if (isValidCharge &&
        this.transaction.type.fixedOrigin &&
        this.transaction.type.fixedOrigin === 0 &&
        this.transaction.type.electronics) {
      isValidCharge = false;
      this.showMessage("Debe configurar un punto de venta para documentos electrónicos. Lo puede hacer en /Configuración/Tipos de Transacción.", "info", true);
      this.loading = false;
    }

    if(isValidCharge &&
      this.transaction.type.electronics &&
      !Config.modules.sale.electronicTransactions) {
      isValidCharge = false;
      this.showMessage("No tiene habilitado el módulo de factura electrónica.", "info", true);
      this.loading = false;
    }

    return isValidCharge;
  }

  public countPrinters(): number {

    let numberOfPrinters: number = 0;
    this.printersAux = new Array();

    if (this.printers != undefined) {
      for (let printer of this.printers) {
        if (this.typeOfOperationToPrint === 'charge' && printer.printIn === PrinterPrintIn.Counter) {
          this.printersAux.push(printer);
          numberOfPrinters++;
        } else if (this.typeOfOperationToPrint === 'bill' && printer.printIn === PrinterPrintIn.Counter) {
          this.printersAux.push(printer);
          numberOfPrinters++;
        } else if (this.typeOfOperationToPrint === 'bar' && printer.printIn === PrinterPrintIn.Bar) {
          this.printersAux.push(printer);
          numberOfPrinters++;
        } else if (this.typeOfOperationToPrint === 'kitchen' && printer.printIn === PrinterPrintIn.Kitchen) {
          this.printersAux.push(printer);
          numberOfPrinters++;
        }
      }
    } else {
      numberOfPrinters = 0;
    }

    return numberOfPrinters;
  }

  public distributeImpressions(printer: Printer) {

    this.printerSelected = printer;

    switch (this.typeOfOperationToPrint) {
      case 'charge':
        if(printer.type === PrinterType.PDF) {
          this.openModal("print");
        }
        break;
      default:
        this.showMessage("No se reconoce la operación de impresión.", "danger", false);
        break;
    }
  }

  public assignLetter() {

    if(Config.companyVatCondition && Config.companyVatCondition.description === "Responsable Inscripto") {
      if (this.transaction.company &&
          this.transaction.company.vatCondition) {
        this.transaction.letter = this.transaction.company.vatCondition.transactionLetter;
      } else {
        this.transaction.letter = "B";
      }
    } else if (Config.companyVatCondition &&  Config.companyVatCondition.description === "Monotributista") {
        this.transaction.letter = "C";
    } else {
      this.transaction.letter = "X";
    }
    
    this.loading = true;
  }

  public assignTransactionNumber() {
    
    this._transactionService.getLastTransactionByTypeAndOrigin(this.transaction.type, this.transaction.origin, this.transaction.letter).subscribe(
      result => {
        if (!result.transactions) {
          this.transaction.number = 1;
        } else {
          this.transaction.number = result.transactions[0].number + 1;
        }
        if (Config.modules.stock &&
          this.transaction.type.modifyStock) {
          this.updateRealStock();
        } else {
          this.finish();
        }
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public saveMovementOfArticle(movementOfArticle: MovementOfArticle): void {

    this.loading = true;

    this._movementOfArticleService.saveMovementOfArticle(movementOfArticle).subscribe(
      result => {
        if (!result.movementOfArticle) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          this.hideMessage();
          movementOfArticle = result.movementOfArticle;
          this.getMovementsOfTransaction();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }
  
  public setPrintBill(): void {
    if (this.movementsOfArticles.length !== 0) {
      this.typeOfOperationToPrint = 'bill';
      this.openModal('printers');
    } else {
      this.showMessage("No existen productos en el pedido.", "info", true);
      this.loading = false;
    }
  }

  public updateRealStock(): void {
    
    if(this.movementsOfArticles.length > 0) {

      this.loading = true;
  
      let amountToModify;
      
      if(this.transaction.type.stockMovement === StockMovement.Inflows || this.transaction.type.name === "Inventario") {
        amountToModify = this.movementsOfArticles[this.amountModifyStock].amount;
      } else {
        amountToModify = this.movementsOfArticles[this.amountModifyStock].amount * -1;
      }
      
      if (this.movementsOfArticles[this.amountModifyStock].article) {
        this._articleStockService.updateRealStock(this.movementsOfArticles[this.amountModifyStock].article, amountToModify, this.transaction.type.name).subscribe(
          result => {
            if (!result.articleStock) {
              if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
            } else {
              this.amountModifyStock++;
              if (this.amountModifyStock === this.movementsOfArticles.length) {
                this.finish();
              } else {
                this.updateRealStock();
              }
            }
            this.loading = false;
          },
          error => {
            this.showMessage(error._body, "danger", false);
            this.loading = false;
          }
        );
      } else {
        this.amountModifyStock++;
        if (this.amountModifyStock === this.movementsOfArticles.length) {
          this.finish();
        } else {
          this.updateRealStock();
        }
      }
    } else {
      this.showMessage("No se encuentran artículos en la transacción", "info", true);
    }
  }

  public backFinal(): void {
    
    if (this.posType === "resto") {
      this._router.navigate(['/pos/resto/salones/' + this.transaction.table.room + '/mesas']);
    } else if (this.posType === "mostrador") {
      if (this.transaction.type.transactionMovement === TransactionMovement.Purchase) {
        this._router.navigate(['/pos/' + this.posType + '/compra']);
      } else if (this.transaction.type.transactionMovement === TransactionMovement.Sale) {
        this._router.navigate(['/pos/' + this.posType + '/venta']);
      } else if (this.transaction.type.transactionMovement === TransactionMovement.Stock) {
        this._router.navigate(['/pos/' + this.posType + '/stock']);
      }
    } else {
      this._router.navigate(['/pos/' + this.posType]);
    }
  }

  public getMovementsOfTransaction(): void {
    
    this.loading = true;

    this._movementOfArticleService.getMovementsOfTransaction(this.transaction._id).subscribe(
      result => {
        if (!result.movementsOfArticles) {
          this.areMovementsOfArticlesEmpty = true;
          this.movementsOfArticles = new Array();
          this.updatePrices();
        } else {
          this.areMovementsOfArticlesEmpty = false;
          this.movementsOfArticles = result.movementsOfArticles;
          this.updatePrices();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public showCategories(): void {

    this.areCategoriesVisible = true;
    this.areArticlesVisible = false;
  }

  public updatePrices(): void {

    this.updateDiscounts();
  }

  public updateTotalPrice(): void {

    this.transaction.totalPrice = 0;

    if (this.movementsOfArticles.length !== 0) {
      for (let movementOfArticle of this.movementsOfArticles) {
        if (this.transaction.type.transactionMovement === TransactionMovement.Sale) {
          this.transaction.totalPrice = this.roundNumber.transform(this.transaction.totalPrice + movementOfArticle.salePrice);
        } else {
          this.transaction.totalPrice = this.roundNumber.transform(this.transaction.totalPrice + movementOfArticle.costPrice);
        }
      }
    } else {
      this.transaction.totalPrice = 0;
      this.transaction.discountAmount = 0;
      this.transaction.discountPercent = 0;
    }

    this.transaction.discountAmount = this.roundNumber.transform(((this.transaction.discountPercent * this.transaction.totalPrice) / (100 - this.transaction.discountPercent)), 3);

    this.updateTaxes();
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