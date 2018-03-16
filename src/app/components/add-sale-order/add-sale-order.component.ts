//Paquetes Angular
import { Component, OnInit, ElementRef, ViewChild, EventEmitter, Output, Input, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

//Paquetes de terceros
import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

//Modelos
import { Transaction, TransactionState } from './../../models/transaction';
import { TransactionType } from './../../models/transaction-type';
import { TransactionTax } from './../../models/transaction-tax';
import { Article, ArticlePrintIn } from './../../models/article';
import { MovementOfArticle } from './../../models/movement-of-article';
import { Table, TableState } from './../../models/table';
import { Employee } from './../../models/employee';
import { Category } from './../../models/category';
import { Room } from './../../models/room';
import { Print } from './../../models/print';
import { Printer, PrinterType, PrinterPrintIn } from './../../models/printer';
import { Turn } from './../../models/turn';
import { Config } from './../../app.config';

//Servicios
import { MovementOfArticleService } from './../../services/movement-of-article.service';
import { TransactionService } from './../../services/transaction.service';
import { TransactionTypeService } from './../../services/transaction-type.service';
import { TableService } from './../../services/table.service';
import { TurnService } from './../../services/turn.service';
import { PrinterService } from './../../services/printer.service';
import { UserService } from './../../services/user.service';
import { PrintService } from './../../services/print.service';

//Componentes
import { ListCompaniesComponent } from './../list-companies/list-companies.component';
import { AddMovementOfCashComponent } from './../add-movement-of-cash/add-movement-of-cash.component';
import { SelectEmployeeComponent } from './../select-employee/select-employee.component';
import { PrintComponent } from './../../components/print/print.component';

//Pipes
import { DecimalPipe } from '@angular/common';
import { DateFormatPipe } from './../../pipes/date-format.pipe';
import { RoundNumberPipe } from './../../pipes/round-number.pipe';
import { CompanyType } from '../../models/company';

@Component({
  selector: 'app-add-sale-order',
  templateUrl: './add-sale-order.component.html',
  styleUrls: ['./add-sale-order.component.css'],
  providers: [NgbAlertConfig, DateFormatPipe, RoundNumberPipe]
})

export class AddSaleOrderComponent implements OnInit {

  public transaction: Transaction;
  public alertMessage: string = "";
  public movementOfArticle: MovementOfArticle;
  public lastMovementOfArticle: MovementOfArticle;
  public movementsOfArticles: MovementOfArticle[];
  public printers: Printer[];
  public printerSelected: Printer;
  public printersAux: Printer[];  //Variable utilizada para guardar las impresoras de una operación determinada (Cocina, mostrador, Bar)
  public amountOfItemForm: FormGroup;
  public discountForm: FormGroup;
  public paymentForm: FormGroup;
  public areMovementsOfArticlesEmpty: boolean = true;
  public userType: string;
  public posType: string;
  public table: Table; //Solo se usa si posType es igual a resto
  public loading: boolean = false;
  public areCategoriesVisible: boolean = true;
  public areArticlesVisible: boolean = false;
  public categorySelected: Category;
  @ViewChild('content') content: ElementRef;
  @ViewChild('contentCancelOrder') contentCancelOrder: ElementRef;
  @ViewChild('contentDiscount') contentDiscount: ElementRef;
  @ViewChild('contentPrinters') contentPrinters: ElementRef;
  @ViewChild('contentMessage') contentMessage: ElementRef;
  public isNewItem: boolean;
  public isCreateItem: boolean;
  public paymentAmount: number = 0.00;
  public typeOfOperationToPrint: string;
  public kitchenArticlesToPrint: MovementOfArticle[];
  public barArticlesToPrint: MovementOfArticle[];
  public printSelected: Print;
  public filterArticle: string;
  public focusEvent = new EventEmitter<boolean>();
  public roundNumber = new RoundNumberPipe();

  public formErrors = {
    'description': '',
    'amount': '',
    'salePrice': ''
  };

  public validationMessages = {
    'description': {
      'required': 'Este campo es requerido.'
    },
    'amount': {
      'required': 'Este campo es requerido.'
    },
    'salePrice': {
      'required': 'Este campo es requerido.'
    }
  };

  public formErrorsDiscount = {
    'totalPrice': '',
    'amount': '',
    'percentage': '',
    'transactionAmount': ''
  };

  public validationMessagesDiscount = {
    'totalPrice': {
      'required': 'Este campo es requerido.'
    },
    'amount': {
      'required': 'Este campo es requerido.'
    },
    'percentage': {
      'required': 'Este campo es requerido.'
    },
    'transactionAmount': {
      'required': 'Este campo es requerido.'
    }
  };

  constructor(
    public _fb: FormBuilder,
    public _transactionService: TransactionService,
    public _transactionTypeService: TransactionTypeService,
    public _movementOfArticleService: MovementOfArticleService,
    public _tableService: TableService,
    public _turnService: TurnService,
    public _printService: PrintService,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal,
    public _printerService: PrinterService,
    public _userService: UserService,
    private cdref: ChangeDetectorRef
  ) {
    this.transaction = new Transaction();
    this.movementOfArticle = new MovementOfArticle();
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
    
    this._transactionTypeService.getTransactionType(transactionTypeID).subscribe(
      result => {
        if (!result.transactionType) {
          this.showMessage(result.message, "info", true);
        } else {
          this.transaction.type = result.transactionType;
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
          this.showMessage(result.message, "info", true);
        } else {
          this.hideMessage();
          this.table = result.table;
          this.transaction.table = this.table;
          this.transaction.diners = this.table.chair;
          this.transaction.employeeOpening = this.table.employee;
          this.transaction.employeeClosing = this.table.employee;
          this.getOpenTurn(this.table.employee);
          this.getTransactionByType('Ticket');
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getTransactionByType(type: string): void {

    this._transactionTypeService.getTransactionByType(type).subscribe(
      result => {
        if (!result.transactionTypes) {
          this.showMessage(result.message, "info", true);
        } else {
          this.transaction.type = result.transactionTypes[0];
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

  public buildForm(): void {

    this.amountOfItemForm = this._fb.group({
      '_id': [this.movementOfArticle._id, [
      ]
      ],
      'description': [this.movementOfArticle.description, [
        Validators.required
      ]
      ],
      'amount': [this.movementOfArticle.amount, [
        Validators.required
      ]
      ],
      'salePrice': [this.movementOfArticle.salePrice, [
        Validators.required
      ]
      ],
      'notes': [this.movementOfArticle.notes, [
      ]
      ]
    });

    this.amountOfItemForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {

    if (!this.amountOfItemForm) { return; }
    const form = this.amountOfItemForm;

    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  public buildFormDiscount(): void {
    this.discountForm = this._fb.group({
      'totalPrice': [this.roundNumber.transform(this.transaction.totalPrice + this.transaction.discountAmount,2), [
          Validators.required
        ]
      ],
      'amount': [this.roundNumber.transform(this.transaction.discountAmount,3), [
          Validators.required
        ]
      ],
      'percentage': [this.roundNumber.transform(this.transaction.discountPercent,3), [
          Validators.required
        ]
      ],
      'transactionAmount': [this.roundNumber.transform(this.transaction.totalPrice,2), [
          Validators.required
        ]
      ]
    });

    this.discountForm.valueChanges
      .subscribe(data => this.onValueChangedDiscount(data));

    this.onValueChangedDiscount();
  }

  public onValueChangedDiscount(data?: any): void {

    if (!this.discountForm) { return; }
    const form = this.discountForm;

    for (const field in this.formErrorsDiscount) {
      this.formErrorsDiscount[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessagesDiscount[field];
        for (const key in control.errors) {
          this.formErrorsDiscount[field] += messages[key] + ' ';
        }
      }
    }
  }

  public updateDiscounts(op: string): void {

    if (op === 'percentage') {
      if (this.discountForm.value.percentage && this.discountForm.value.percentage >= 0) {
        this.discountForm.value.amount = this.roundNumber.transform(((this.transaction.totalPrice + this.transaction.discountAmount) * this.discountForm.value.percentage / 100),3);
        this.discountForm.value.transactionAmount = this.roundNumber.transform(((this.transaction.totalPrice + this.transaction.discountAmount) - this.discountForm.value.amount),2);
      } else {
        this.discountForm.value.amount = 0;
        this.discountForm.value.percentage = 0;
      }
    } else if (op === 'amount') {
      if (this.discountForm.value.amount && this.discountForm.value.amount >= 0) {
        this.discountForm.value.transactionAmount = this.roundNumber.transform(((this.transaction.totalPrice + this.transaction.discountAmount) - this.discountForm.value.amount),2);
        this.discountForm.value.percentage = this.roundNumber.transform((this.discountForm.value.amount * 100 / (this.transaction.totalPrice + this.transaction.discountAmount)),3);
      } else {
        this.discountForm.value.amount = 0;
        this.discountForm.value.percentage = 0;
      }
    }

    this.setValueFormDiscount();
  }

  public setValueFormDiscount() {

    this.discountForm.value.amount = this.roundNumber.transform(this.discountForm.value.amount,3);
    this.discountForm.value.transactionAmount = this.roundNumber.transform(this.discountForm.value.transactionAmount,2);
    this.discountForm.value.percentage = this.roundNumber.transform(this.discountForm.value.percentage,3);

    this.discountForm.setValue({
      'totalPrice': this.transaction.totalPrice + this.transaction.discountAmount,
      'percentage': this.discountForm.value.percentage,
      'amount': this.discountForm.value.amount,
      'transactionAmount': this.discountForm.value.transactionAmount
    });
  }

  public addTransaction(): void {

    this.loading = true;
    this.transaction.madein = this.posType;
    
    this._transactionService.saveTransaction(this.transaction).subscribe(
      result => {
        if (!result.transaction) {
          this.showMessage(result.message, "info", true);
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

  public updateTransaction(closed?: boolean): void {

    this.loading = true;
    
    this._transactionService.updateTransaction(this.transaction).subscribe(
      result => {
        if (!result.transaction) {
          this.showMessage(result.message, "info", true);
        } else {
          //No anulamos el mensaje para que figuren en el pos, si es que da otro error.
          if (closed) {
            this.back();
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
        this.back();
      }
    }
  }

  public changeStateOfTable(state: any, closed: boolean): void {

    this.loading = true;

    this.table.state = state;
    this._tableService.updateTable(this.table).subscribe(
      result => {
        if (!result.table) {
          this.showMessage(result.message, "info", true);
        } else {
          this.table = result.table;
          if (closed) {
            this.back();
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
          this.showMessage(result.message, "info", true);
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

  public addItem(itemData?: MovementOfArticle): void {

    if (itemData) {
      if (!this.lastMovementOfArticle || itemData.code !== this.lastMovementOfArticle.code) {
        let article: Article = new Article();
        article.basePrice = itemData.basePrice;
        article.VATAmount = itemData.VATAmount;
        article.costPrice = itemData.costPrice;
        article.markupPrice = itemData.markupPrice;
        article.salePrice = itemData.salePrice;
        this.movementOfArticle = itemData;
        this.movementOfArticle.article = article;
        this.movementOfArticle.article._id = itemData._id;
        this.movementOfArticle.printed = 0;
        this.movementOfArticle.transaction = this.transaction;
        this.movementOfArticle.amount = 1;
        this.lastMovementOfArticle = this.movementOfArticle;
        if (this.filterArticle !== undefined &&
          this.filterArticle !== "") {

          this.isNewItem = true;
          this.isCreateItem = false;

          this.buildForm();

          this.setValueFormAmountOfItem();
          this.cleanFilterArticle();
          this.openModal('edit_item');
        } else {
          this.saveMovementOfArticle();
        }
      } else {
        this.movementOfArticle = this.lastMovementOfArticle;
        this.movementOfArticle.amount += 1;
        this.movementOfArticle.basePrice += itemData.basePrice;
        this.movementOfArticle.VATAmount += itemData.VATAmount;
        this.movementOfArticle.costPrice += itemData.costPrice;
        this.movementOfArticle.markupPrice += itemData.markupPrice;
        this.movementOfArticle.salePrice += itemData.salePrice;
        if (this.filterArticle !== undefined &&
          this.filterArticle !== "") {

          this.isNewItem = false;
          this.isCreateItem = false;

          this.buildForm();

          this.setValueFormAmountOfItem();
          this.cleanFilterArticle();
          this.openModal('edit_item');
        } else {
          this.updateMovementOfArticle(this.movementOfArticle);
        }
      }

    } else {
      this.buildForm();
      this.isCreateItem = true;
      this.isNewItem = false;
      this.movementOfArticle = new MovementOfArticle();
      this.setValueFormAmountOfItem();
      this.movementOfArticle.transaction = this.transaction;
      this.openModal('add_new_item');
    }
  }

  public cleanFilterArticle(): void {
    this.filterArticle = "";
    this.areArticlesVisible = false;
    this.areCategoriesVisible = true;
  }

  public updateTaxes(): void {

    let taxes: TransactionTax[] = new Array();
    let taxesAUX: TransactionTax[] = new Array();
    let VATs: any[] = new Array();
    let isSavedTax: boolean = false;
    this.transaction.exempt = 0;

    for (let movementOfArticle of this.movementsOfArticles) {

      if (movementOfArticle.VATPercentage !== 0) {

        let tax = new TransactionTax();
        tax.percentage = movementOfArticle.VATPercentage;
        tax.tax = "IVA";
        tax.taxBase = this.roundNumber.transform(movementOfArticle.salePrice / ((movementOfArticle.VATPercentage / 100) + 1),2);
        tax.taxAmount = this.roundNumber.transform(tax.taxBase * movementOfArticle.VATPercentage / 100,2);
        taxesAUX.push(tax);

        if (VATs.length !== 0) {
          let exist: boolean = false;
          for (let VAT of VATs) {
            if (VAT.tax === tax.tax &&
              VAT.percentage === tax.percentage) {
              exist = true;
            }
          }
          if (exist === false) {
            VATs.push({
              "tax": tax.tax,
              "percentage": tax.percentage
            });
          }
        } else {
          VATs.push({
            "tax": tax.tax,
            "percentage": tax.percentage
          });
        }
      } else {
        this.transaction.exempt += movementOfArticle.salePrice;
      }
    }

    for (let VAT of VATs) {
      let tax = new TransactionTax();
      tax.percentage = VAT.percentage;
      tax.tax = VAT.tax;
      tax.taxAmount = 0;
      tax.taxBase = 0;
      for (let taxAUX of taxesAUX) {
        if (taxAUX.percentage === VAT.percentage &&
          VAT.tax === taxAUX.tax) {
          tax.taxAmount += taxAUX.taxAmount;
          tax.taxBase += taxAUX.taxBase;
        }
      }
      taxes.push(tax);
    }

    this.transaction.taxes = taxes;
    this.updateTransaction(false);
  }

  public editItem(itemData: MovementOfArticle): void {

    this.isCreateItem = false;
    this.isNewItem = false;

    this.buildForm();

    this.movementOfArticle = itemData;
    this.setValueFormAmountOfItem();

    this.openModal('edit_item');
  }

  public setValueFormAmountOfItem(): void {

    if (!this.movementOfArticle._id) this.movementOfArticle._id = "";
    if (!this.movementOfArticle.description) this.movementOfArticle.description = "";
    if (!this.movementOfArticle.amount) this.movementOfArticle.amount = 1;
    if (!this.movementOfArticle.salePrice) this.movementOfArticle.salePrice = 0;
    if (!this.movementOfArticle.notes) this.movementOfArticle.notes = "";

    this.movementOfArticle.amount = this.roundNumber.transform(this.movementOfArticle.amount, 2);
    this.movementOfArticle.salePrice = this.roundNumber.transform(this.movementOfArticle.salePrice,2);

    this.amountOfItemForm.setValue({
      '_id': this.movementOfArticle._id,
      'description': this.movementOfArticle.description,
      'amount': this.movementOfArticle.amount,
      'salePrice': this.movementOfArticle.salePrice,
      'notes': this.movementOfArticle.notes,
    });

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
          this.transaction.CAEExpirationDate = result.CAEExpirationDate;
          this.updateTransaction();
          this.openModal("printers");
          this.hideMessage();
        }
        this.loading = false;
      },
      error => {
        this.showMessage("Ha ocurrido un error en el servidor: " + error, "danger", false);
        this.loading = false;
      }
    )
  }

  public openModal(op: string): void {

    let modalRef;

    switch (op) {
      case 'edit_item':
        let cantidadOriginal = this.movementOfArticle.amount;
        modalRef = this._modalService.open(this.content, { size: 'lg' }).result.then((result) => {
          if (result === "edit_item") {
            this.confirmAmount('edit');
          } else if (result === "delete_item") {
            this.deleteMovementOfArticle();
          } else {
            this.movementOfArticle.amount = cantidadOriginal;
          }
        }, (reason) => {
          this.movementOfArticle.amount = cantidadOriginal;
        });
        break;
      case 'add_new_item':

        modalRef = this._modalService.open(this.content, { size: 'lg' }).result.then((result) => {
          if (result === "edit_item") {
            this.confirmAmount('add');
          }
        }, (reason) => {

        });
        break;
      case 'apply_discount':

        this.buildFormDiscount();

        if (this.movementsOfArticles.length !== 0) {
          modalRef = this._modalService.open(this.contentDiscount, { size: 'lg' }).result.then((result) => {
            if (result === "apply_discount") {
              this.applyDiscount(this.discountForm.value.percentage, this.discountForm.value.amount);
            }
          }, (reason) => {

          });
        } else {
          this.showMessage("No existen productos en el pedido.", "info", true);
          this.loading = false;
        }
        break;
      case 'cancel_transaction':

        modalRef = this._modalService.open(this.contentCancelOrder, { size: 'lg' }).result.then((result) => {
          if (result === "cancel_transaction") {
            this.transaction.state = TransactionState.Canceled;
            this.transaction.endDate = moment().format('DD/MM/YYYY HH:mm:ss');
            if (this.posType === "resto") {
              this.updateTransaction(false);
              this.table.employee = null;
              this.changeStateOfTable(TableState.Available, true);
            } else if (this.posType === "mostrador") {
              this.updateTransaction(true);
            }
          }
        }, (reason) => {

        });
        break;
      case 'add_client':

        modalRef = this._modalService.open(ListCompaniesComponent, { size: 'lg' });
        modalRef.componentInstance.type = CompanyType.Client;
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
        if (this.movementsOfArticles.length !== 0) {
          if (this.transaction.type.electronics === "No" ||
              (this.transaction.company && this.transaction.type.electronics === "Si")) {
            if (this.transaction.type.electronics === "No" ||
                (this.transaction.type.electronics === "Si" &&
                (this.transaction.company.CUIT || this.transaction.company.DNI))) {
                modalRef = this._modalService.open(AddMovementOfCashComponent, { size: 'lg' });
                modalRef.componentInstance.transaction = this.transaction;
                modalRef.result.then((result) => {
                  if (typeof result == 'object') {
                    
                    if (result.amountPaid > this.transaction.totalPrice && result.type.name === "Tarjeta de Crédito") {
                      let movementOfArticle = new MovementOfArticle();
                      movementOfArticle.code = "0";
                      movementOfArticle.description = "Recargo con Tarjeta de Crédito";
                      movementOfArticle.VATPercentage = 21;
                      movementOfArticle.salePrice = result.amountPaid - this.transaction.totalPrice;
                      movementOfArticle.VATAmount = movementOfArticle.salePrice * movementOfArticle.VATPercentage / 100;
                      movementOfArticle.transaction = this.transaction;
                      this.movementOfArticle = movementOfArticle;
                      this.transaction.totalPrice = result.amountPaid;
                      this.saveMovementOfArticle();
                    }

                    if (this.transaction.type.fixedOrigin && this.transaction.type.fixedOrigin !== 0) {
                      this.assignOriginAndLetter(this.transaction.type.fixedOrigin);
                      if( this.transaction.type.electronics === "Si" && 
                          !this.transaction.CAE) {
                        this.validateElectronicTransaction();
                      } else {
                        if (this.transaction.type.printable && 
                            this.transaction.type.printable === "Si") {
                          if(this.transaction.type.defectPrinter) {
                            this.printerSelected = this.transaction.type.defectPrinter;
                            this.assignTransactionNumber();
                            this.distributeImpressions(this.transaction.type.defectPrinter);
                          } else {
                            this.openModal('printers');
                          }
                        } else {
                            this.assignTransactionNumber();
                            this.loading = false;
                        }
                      }
                    } else {
                      if (this.transaction.type.electronics === "Si") {
                        this.showMessage("Debe configurar un punto de venta para facturar.", "info", true);
                        this.loading = false;
                      } else {
                        if(this.transaction.type.printable === "Si") {
                          if(this.transaction.type.defectPrinter) {
                            this.printerSelected = this.transaction.type.defectPrinter;
                            this.distributeImpressions(this.transaction.type.defectPrinter);
                          } else {
                            this.openModal('printers');
                          }
                        } else {
                          if (this.typeOfOperationToPrint === "charge") {
                            if (this.transaction.type.fixedOrigin && this.transaction.type.fixedOrigin !== 0) {
                              this.assignOriginAndLetter(this.transaction.type.fixedOrigin);
                            } else {
                              let origin = 0;
                              this.assignOriginAndLetter(origin);
                            }
                            this.assignTransactionNumber();
                            this.loading = false;
                          } else if (this.typeOfOperationToPrint === "bill") {
                            this.changeStateOfTable(TableState.Pending, true);
                          } else {
                            if (this.posType === "resto") {
                              this.changeStateOfTable(TableState.Busy, true);
                            } else {
                              this.back();
                            }
                          }
                        }
                      }
                    }
                  }
                }, (reason) => {
                }
              );
            } else {
              this.showMessage("El cliente ingresado no tiene CUIT/DNI.", "info", true);
              this.loading = false;
            }
          } else {
            this.showMessage("Debe cargar un cliente al pedido.", "info", true);
            this.loading = false;
          }
        } else {
          this.showMessage("No existen productos en el pedido.", "info", true);
          this.loading = false;
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
        } else if (this.countPrinters() !== 0) {
          this.distributeImpressions(this.printersAux[0]);
        } else {
          if (this.typeOfOperationToPrint === "charge") {
            if (this.transaction.type.electronics === "No") {
              this.assignTransactionNumber();
              this.loading = false;
            } else {
              this.finishCharge();
            }
          } else if (this.typeOfOperationToPrint === "bill") {
            this.changeStateOfTable(TableState.Pending, true);
          } else {
            if (this.posType === "resto") {
              this.changeStateOfTable(TableState.Busy, true);
            } else {
              this.back();
            }
          }
        }
        break;
      case 'errorMessage':
        modalRef = this._modalService.open(this.contentMessage, { size: 'lg' }).result.then((result) => {
          if (result !== "cancel" && result !== "") {
            if (this.typeOfOperationToPrint === "charge") {
              this.assignOriginAndLetter(this.printerSelected.origin);
              this.assignTransactionNumber();
            } else if (this.typeOfOperationToPrint === "bill") {
              this.changeStateOfTable(TableState.Pending, true);
            } else {
              if (this.posType === 'resto') {
                this.changeStateOfTable(TableState.Busy, true);
              } else {
                this.back();
              }
            }
          }
        }, (reason) => {

        });
        break;
      case 'change-employee':
        modalRef = this._modalService.open(SelectEmployeeComponent);
        modalRef.componentInstance.requireLogin = true;
        modalRef.componentInstance.op = "change-employee";
        modalRef.result.then((result) => {
          if (typeof result == 'object') {
            this.transaction.turnClosing = result;
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
          this.finishCharge();
          this.hideMessage();
        });
        // modalRef.componentInstance.print = this.printSelected;
        // if (this.typeOfOperationToPrint === 'charge') {
        //   modalRef.componentInstance.movementsOfArticles = this.movementsOfArticles;
        // } else if (this.typeOfOperationToPrint === 'bill') {
        //   modalRef.componentInstance.movementsOfArticles = this.movementsOfArticles;
        // } else if (this.typeOfOperationToPrint === 'bar') {
        //   modalRef.componentInstance.movementsOfArticles = this.barArticlesToPrint;
        // } else if (this.typeOfOperationToPrint === 'kitchen') {
        //   modalRef.componentInstance.movementsOfArticles = this.kitchenArticlesToPrint;
        // }
        // modalRef.componentInstance.typePrint = this.typeOfOperationToPrint;
        // modalRef.result.then(
        //   (result) => {
        //     if (this.typeOfOperationToPrint === 'kitchen') {
        //       for (let movementOfArticle of this.kitchenArticlesToPrint) {
        //         movementOfArticle.printed += movementOfArticle.amount;
        //         this.updateMovementOfArticle(movementOfArticle);
        //       }
        //       if (this.posType === 'resto') {
        //         this.changeStateOfTable(TableState.Pending, true);
        //       }
        //     } else if (this.typeOfOperationToPrint === 'bill') {
        //       if (this.posType === 'resto') {
        //         this.changeStateOfTable(TableState.Pending, true);
        //       }
        //     } else if (this.typeOfOperationToPrint === 'charge') {
        //       this.finishCharge();
        //     } else if (this.typeOfOperationToPrint === 'bar') {
        //       for (let movementOfArticle of this.barArticlesToPrint) {
        //         movementOfArticle.printed += movementOfArticle.amount;
        //         this.updateMovementOfArticle(movementOfArticle);
        //       }
        //       if (this.kitchenArticlesToPrint.length === 0) {
        //         if (this.posType === 'resto') {
        //           this.changeStateOfTable(TableState.Pending, true);
        //         } else if (this.posType === 'resto') {
        //           this.back();
        //         }
        //       } else {
        //         this.typeOfOperationToPrint = "kitchen";
        //         this.openModal("printers");
        //       }
        //     }
        // }, (reason) => {

        // });
        break;
      default: ;
    };
  }

  public applyDiscount(percentage: number, amount: number): void {
    
    for (let movementOfArticle of this.movementsOfArticles) {
      if(percentage !== 0) {
        movementOfArticle.markupPercentage = this.roundNumber.transform(movementOfArticle.markupPercentage - (percentage - this.transaction.discountPercent),2);
        if(movementOfArticle.costPrice === 0) {
          movementOfArticle.salePrice = this.roundNumber.transform((movementOfArticle.article.salePrice - (movementOfArticle.article.salePrice * percentage / 100)), 2);
          movementOfArticle.markupPrice = this.roundNumber.transform(movementOfArticle.salePrice, 3);
        } else {
          movementOfArticle.markupPrice = this.roundNumber.transform((movementOfArticle.costPrice * movementOfArticle.markupPercentage / 100), 3);
          movementOfArticle.salePrice = this.roundNumber.transform(movementOfArticle.costPrice + movementOfArticle.markupPrice, 2);
        }
      } else {
        movementOfArticle.markupPercentage = movementOfArticle.article.markupPercentage;
        movementOfArticle.salePrice = movementOfArticle.article.salePrice;
        movementOfArticle.markupPrice = movementOfArticle.article.markupPrice;
      }
      this.updateMovementOfArticle(movementOfArticle);
    }
    this.transaction.discountPercent = this.roundNumber.transform(percentage, 3);
    this.transaction.discountAmount = this.roundNumber.transform(amount, 3);
    this.updateTransaction(false);
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
        } else {
          this.toPrintCharge(printer);
        }
        break;
      case 'bill':
        if (printer.type === PrinterType.PDF) {
          this.openModal("print");
        } else {
          this.toPrintBill(printer);
        }
        break;
      case 'bar':
        if (printer.type === PrinterType.PDF) {
          this.openModal("print");
        } else {
          this.toPrintBar(printer);
        }
        break;
      case 'kitchen':
        if (printer.type === PrinterType.PDF) {
          this.openModal("print");
        } else {
          this.toPrintKitchen(printer);
        }
        break;
      default:
        this.showMessage("No se reconoce la operación de impresión.", "danger", false);
        break;
    }
  }

  public assignOriginAndLetter(origin: number) {
    
    this.transaction.origin = origin;
    if (this.transaction.company &&
        this.transaction.company.vatCondition) {
      this.transaction.letter = this.transaction.company.vatCondition.transactionLetter;
    } else {
      this.transaction.letter = "X";
    }

    this.loading = true;
  }

  public assignTransactionNumber() {

    if(this.transaction.type.electronics !== "Si") {
      this._transactionService.getLastTransactionByTypeAndOrigin(this.transaction.type, this.transaction.origin, this.transaction.letter).subscribe(
        result => {
          if (!result.transactions) {
            this.transaction.number = 1;
            this.finishCharge();
          } else {
            this.transaction.number = result.transactions[0].number + 1;
            this.finishCharge();
          }
          this.loading = false;
        },
        error => {
          this.showMessage(error._body, "danger", false);
          this.loading = false;
        }
      );
    } else {
      this.finishCharge();
      this.loading = false;
    }
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

  public finishCharge() {

    this.transaction.endDate = moment().format('DD/MM/YYYY HH:mm:ss');
    this.transaction.endDate = this.transaction.endDate;
    this.transaction.state = TransactionState.Closed;
    
    if (this.posType === "resto") {
      this.updateTransaction(false);
      this.table.employee = null;
      this.changeStateOfTable(TableState.Available, true);
    } else {
      this.updateTransaction(true);
    }
  }

  public back(): void {
    if (this.posType === "resto") {
      this._router.navigate(['/pos/resto/salones/' + this.transaction.table.room + '/mesas']);
    } else {
      this._router.navigate(['/pos/' + this.posType]);
    }
  }

  public confirmAmount(op: string): void {

    this.movementOfArticle.description = this.amountOfItemForm.value.description;
    this.movementOfArticle.amount = this.amountOfItemForm.value.amount;
    this.movementOfArticle.notes = this.amountOfItemForm.value.notes;
    this.movementOfArticle.salePrice = this.roundNumber.transform(this.movementOfArticle.amount * this.movementOfArticle.article.salePrice, 2);
    this.movementOfArticle.basePrice = this.roundNumber.transform(this.movementOfArticle.amount * this.movementOfArticle.article.basePrice, 2);
    this.movementOfArticle.VATAmount = this.roundNumber.transform(this.movementOfArticle.amount * this.movementOfArticle.article.VATAmount, 2);
    this.movementOfArticle.costPrice = this.roundNumber.transform(this.movementOfArticle.amount * this.movementOfArticle.article.costPrice, 2);
    this.movementOfArticle.markupPrice = this.roundNumber.transform(this.movementOfArticle.amount * this.movementOfArticle.article.markupPrice, 2);
    this.movementOfArticle.costPrice = this.roundNumber.transform(this.movementOfArticle.amount * this.movementOfArticle.article.costPrice, 2);
    this.movementOfArticle.printed = 0;
    if (op === 'add') {
      this.saveMovementOfArticle();
    } else if (op === 'edit') {
      if(this.isNewItem) {
        this.saveMovementOfArticle();
      } else {
        this.updateMovementOfArticle(this.movementOfArticle);
      }
    }
  }

  public saveMovementOfArticle(): void {

    this.loading = true;

    this._movementOfArticleService.saveMovementOfArticle(this.movementOfArticle).subscribe(
      result => {
        if (!result.movementOfArticle) {
          this.showMessage(result.message, "info", true);
        } else {
          this.hideMessage();
          this.movementOfArticle = result.movementOfArticle;
          this.getMovementsOfTransaction();
          this.movementOfArticle = new MovementOfArticle();
          this.buildForm();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public addAmount(): void {
    this.movementOfArticle.amount += 1;
    this.setValueFormAmountOfItem();
  }

  public subtractAmount(): void {
    if (this.amountOfItemForm.value.amount > 1) {
      this.movementOfArticle.amount -= 1;
      this.setValueFormAmountOfItem();
    } else {
      this.movementOfArticle.amount = 1;
      this.setValueFormAmountOfItem();
    }
  }

  public getMovementsOfTransaction(): void {

    this.loading = true;

    this._movementOfArticleService.getMovementsOfTransaction(this.transaction._id).subscribe(
      result => {
        if (!result.movementsOfArticles) {
          this.areMovementsOfArticlesEmpty = true;
          this.movementsOfArticles = new Array();
          this.lastMovementOfArticle = undefined;
          this.updatePrices();
        } else {
          this.areMovementsOfArticlesEmpty = false;
          this.movementsOfArticles = result.movementsOfArticles;
          this.lastMovementOfArticle = result.movementsOfArticles[result.movementsOfArticles.length - 1];
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

  public deleteMovementOfArticle(): void {

    this.loading = true;

    this._movementOfArticleService.deleteMovementOfArticle(this.amountOfItemForm.value._id).subscribe(
      result => {
        this.getMovementsOfTransaction();
        this.activeModal.close();
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }



  public updatePrices(): void {

    this.transaction.totalPrice = 0;

    if(this.movementsOfArticles.length !== 0) {
      for (let movementOfArticle of this.movementsOfArticles) {
        this.transaction.totalPrice = this.roundNumber.transform(this.transaction.totalPrice + movementOfArticle.salePrice,2);
      }
    } else {
      this.transaction.totalPrice = 0;
      this.transaction.discountAmount = 0;
      this.transaction.discountPercent = 0;
    }

    this.updateTaxes();
  }

  public toPrintBill(printerSelected: Printer): void {

    this.loading = true;
    this.showMessage("Imprimiendo, Espere un momento...", "info", false);

    if (this.movementsOfArticles.length !== 0) {

      this.typeOfOperationToPrint = 'charge';

      let datePipe = new DateFormatPipe();
      let decimalPipe = new DecimalPipe('ARS');
      let content: string;

      content =
        '<table>' +
        '<tbody>';
      if (Config.companyName) content += '<tr><td colspan="12" align="center"><b><font face="Courier">' + Config.companyName + '</font><td></tr>';
      if (Config.companyCUIT) content += '<tr><td colspan="12"><font face="Courier" size="2">CUIT Nro.: ' + Config.companyCUIT + '</font></font></td></tr>';
      if (Config.companyAddress) content += '<tr><td colspan="12"><font face="Courier" size="2">' + Config.companyAddress + '</font></td></tr>';
      if (Config.companyPhone) content += '<tr><td colspan="12"><font face="Courier" size="2">Tel: ' + Config.companyPhone + '</font></td></tr>';
      content +=
        '<tr><td colspan="5"><font face="Courier" size="2">P.V. Nro.: ' + decimalPipe.transform(this.transaction.origin, '4.0-0').replace(/,/g, "") + '</font></td>' +
        '<td colspan="7" align="right"><font face="Courier" size="2">Nro. T.            ' + decimalPipe.transform(this.transaction.number, '8.0-0').replace(/,/g, "") + '</font></td></tr>' +
        '<tr><td colspan="7"><font face="Courier" size="2">Fecha ' + datePipe.transform(this.transaction.endDate, 'DD/MM/YYYY') + '</font></td>' +
        '<td colspan="5" align="right"><font face="Courier" size="2">Hora ' + datePipe.transform(this.transaction.endDate, 'HH:mm') + '</font></td></tr>';
      if (this.transaction.table) content += '<tr><td colspan="4"><font face="Courier" size="2">Mesa: ' + this.transaction.table.description + '</font></td>';
      if (this.transaction.employeeClosing) content += '<td colspan="8" align="right"><font face="Courier" size="2">Mozo: ' + this.transaction.employeeClosing.name + '</font></td></tr>';
      if (this.transaction.company) content += '<tr><td colspan="12"><font face="Courier" size="2">Cliente: ' + this.transaction.company.name + '</font></td></tr>';
      content += '<tr><td colspan="12"><hr></td></tr>';
      for (let movementOfArticle of this.movementsOfArticles) {
        content +=
          '<tr>' +
          '<td colspan="7"><font face="Courier" size="2">' + movementOfArticle.description + '</font></td>' +
          '<td colspan="2"><font face="Courier" size="2">' + movementOfArticle.amount + '</font></td>' +
          '<td colspan="3" align="right"><font face="Courier" size="2">' + decimalPipe.transform(movementOfArticle.salePrice, '1.2-2') + '</font></td>' +
          '</tr>';
        if (movementOfArticle.notes) {
          content +=
            '<tr>' +
            '<td colspan="12"><font face="Courier" size="1"><em>' + movementOfArticle.notes + '<em></font></td>' +
            '</tr>';
        }
      }

      content +=
        '<tr><td colspan="12"><hr></td></tr>' +
        '<tr><td colspan="6"><font face="Courier" size="2">Descuento:</font></td>' +
        '<td colspan="6" align="right"><font face="Courier" size="2">' + '-' + decimalPipe.transform(this.transaction.discountAmount, '1.2-2') + '</font></td></tr>' +
        '<tr><td colspan="6"><font face="Courier" size="2"><b>Total:</b></font></td>' +
        '<td colspan="6" align="right"><font face="Courier" size="2"><b>' + decimalPipe.transform(this.transaction.totalPrice, '1.2-2') + '</b></font></td></tr>' +
        '</tbody>' +
        '</table>';

      let fileName: string = 'pedido-' + this.transaction.origin + '-' + this.transaction.number;

      let print = new Print();
      print.fileName = fileName;
      print.content = content;
      print.printer = printerSelected;
      this.printSelected = print;

      this._printService.toPrint(print).subscribe(
        result => {
          if (result.message !== "ok") {
            this.showMessage(result.message, "info", true);
          } else {
            if (this.posType === 'resto') {
              this.changeStateOfTable(TableState.Pending, true);
            } else {
              this.back();
            }
            this.hideMessage();
          }
          this.loading = false;
        },
        error => {
          this.openModal('errorMessage');
          this.hideMessage();
        }
      );
    } else {
      this.showMessage("No existen productos en el pedido.", "info", true);
    }
  }

  public toPrintCharge(printerSelected: Printer): void {

    this.loading = true;
    this.showMessage("Imprimiendo, Espere un momento...", "info", false);
    if(printerSelected.type === PrinterType.PDF) {
      this.openModal("print");
    } else {
      if (this.movementsOfArticles.length !== 0) {
  
        this.typeOfOperationToPrint = 'charge';
  
        let datePipe = new DateFormatPipe();
        let decimalPipe = new DecimalPipe('ARS');
        let content: string;
  
        content =
          '<table>' +
          '<tbody>';
        if (Config.companyName) content += '<tr><td colspan="12" align="center"><b><font face="Courier">' + Config.companyName + '</font><td></tr>';
        if (Config.companyCUIT) content += '<tr><td colspan="12"><font face="Courier" size="2">CUIT Nro.: ' + Config.companyCUIT + '</font></font></td></tr>';
        if (Config.companyAddress) content += '<tr><td colspan="12"><font face="Courier" size="2">' + Config.companyAddress + '</font></td></tr>';
        if (Config.companyPhone) content += '<tr><td colspan="12"><font face="Courier" size="2">Tel: ' + Config.companyPhone + '</font></td></tr>';
        content +=
          '<tr><td colspan="7"><font face="Courier" size="2">Fecha ' + datePipe.transform(this.transaction.startDate, 'DD/MM/YYYY') + '</font></td>' +
          '<td colspan="5" align="right"><font face="Courier" size="2">Hora ' + datePipe.transform(this.transaction.startDate, 'HH:mm') + '</font></td></tr>';
        if (this.transaction.table) content += '<tr><td colspan="4"><font face="Courier" size="2">Mesa: ' + this.transaction.table.description + '</font></td>';
        if (this.transaction.employeeClosing) content += '<td colspan="8" align="right"><font face="Courier" size="2">Mozo: ' + this.transaction.employeeOpening.name + '</font></td></tr>';
        if (this.transaction.company) content += '<tr><td colspan="12"><font face="Courier" size="2">Cliente: ' + this.transaction.company.name + '</font></td></tr>';
        content += '<tr><td colspan="12"><hr></td></tr>';
        for (let movementOfArticle of this.movementsOfArticles) {
          content +=
            '<tr>' +
            '<td colspan="7"><font face="Courier" size="2">' + movementOfArticle.description + '</font></td>' +
            '<td colspan="2"><font face="Courier" size="2">' + movementOfArticle.amount + '</font></td>' +
            '<td colspan="3" align="right"><font face="Courier" size="2">' + decimalPipe.transform(movementOfArticle.salePrice, '1.2-2') + '</font></td>' +
            '</tr>';
          if (movementOfArticle.notes) {
            content +=
              '<tr>' +
              '<td colspan="12"><font face="Courier" size="1"><em>' + movementOfArticle.notes + '<em></font></td>' +
              '</tr>';
          }
        }
  
        content +=
          '<tr><td colspan="12"><hr></td></tr>' +
          '<tr><td colspan="6"><font face="Courier" size="2">Descuento:</font></td>' +
          '<td colspan="6" align="right"><font face="Courier" size="2">' + '-' + decimalPipe.transform(this.transaction.discountAmount, '1.2-2') + '</font></td></tr>' +
          '<tr><td colspan="6"><font face="Courier" size="2"><b>Total:</b></font></td>' +
          '<td colspan="6" align="right"><font face="Courier" size="2"><b>' + decimalPipe.transform(this.transaction.totalPrice, '1.2-2') + '</b></font></td></tr>' +
          '<tr><td colspan="12" align="center"><font face="Courier" size="2">Ticket no válido como factura.</font></td></tr>' +
          '<tr><td colspan="12" align="center"><font face="Courier" size="2">*Gracias por su visita*</font></td></tr>' +
          '</tbody>' +
          '</table>';
  
        let fileName: string = 'pedido-' + this.transaction.origin + '-' + this.transaction.number;
  
        let print = new Print();
        print.fileName = fileName;
        print.content = content;
        print.printer = printerSelected;
        this.printSelected = print;
  
        this._printService.toPrint(print).subscribe(
          result => {
            if (result.message !== "ok") {
              this.showMessage(result.message, "info", true);
            } else {
              this.assignOriginAndLetter(printerSelected.origin);
              this.assignTransactionNumber();
              this.hideMessage();
            }
            this.loading = false;
          },
          error => {
            this.openModal('errorMessage');
            this.hideMessage();
          }
        );
      } else {
        this.showMessage("No existen productos en el pedido.", "info", true);
      }
    }
  }

  public toPrintBar(printerSelected: Printer): void {

    this.loading = true;
    this.showMessage("Imprimiendo, Espere un momento...", "info", false);

    if (this.movementsOfArticles.length !== 0) {

      this.typeOfOperationToPrint = 'bar';

      let datePipe = new DateFormatPipe();
      let decimalPipe = new DecimalPipe('ARS');
      let content: string;

      content =
        '<table>' +
        '<tbody>' +
        '<tr><td colspan="12" align="center"><b><font face="Courier">BAR</font><td></tr>';
      if (Config.companyName) content += '<tr><td colspan="12" align="center"><b><font face="Courier">' + Config.companyName + '</font><td></tr>';
      content +=
        '<tr><td colspan="12"><font face="Courier" size="2">Nro. Pedido ' + this.transaction.number + '</font></td></tr>' +
        '<tr><td colspan="7"><font face="Courier" size="2">Fecha ' + datePipe.transform(this.transaction.endDate, 'DD/MM/YYYY') + '</font></td>' +
        '<td colspan="5" align="right"><font face="Courier" size="2">Hora ' + datePipe.transform(this.transaction.startDate, 'HH:mm') + '</font></td></tr>';
      if (this.transaction.table) content += '<tr><td colspan="4"><font face="Courier" size="2">Mesa: ' + this.transaction.table.description + '</font></td>';
      if (this.transaction.employeeClosing) content += '<td colspan="8" align="right"><font face="Courier" size="2">Mozo: ' + this.transaction.employeeClosing.name + '</font></td></tr>';
      content += '<tr><td colspan="12"><hr></td></tr>';
      for (let movementOfArticle of this.barArticlesToPrint) {
        content +=
          '<tr>' +
          '<td colspan="3"><font face="Courier" size="2">' + (movementOfArticle.amount - movementOfArticle.printed) + '</font></td>' +
          '<td colspan="9"><font face="Courier" size="2">' + movementOfArticle.description + '</font></td>' +
          '</tr>';
        if (movementOfArticle.notes) {
          content +=
            '<tr>' +
            '<td colspan="12"><font face="Courier" size="1"><em>' + movementOfArticle.notes + '<em></font></td>' +
            '</tr>';
        }
      }

      content +=
        '</tbody>' +
        '</table>';

      let fileName: string = 'pedido-' + this.transaction.origin + '-' + this.transaction.number;

      let print = new Print();
      print.fileName = fileName;
      print.content = content;
      print.printer = printerSelected;
      this.printSelected = print;

      this._printService.toPrint(print).subscribe(
        result => {
          if (result.message !== "ok") {
            this.showMessage(result.message, "info", true);
          } else {
            for (let movementOfArticle of this.barArticlesToPrint) {
              movementOfArticle.printed = movementOfArticle.amount;
              this.updateMovementOfArticle(movementOfArticle);
            }
            if (this.kitchenArticlesToPrint.length === 0) {
              if (this.posType === 'resto') {
                this.changeStateOfTable(TableState.Busy, true);
              } else {
                this.back();
              }
            } else {
              this.typeOfOperationToPrint = "kitchen";
              this.openModal("printers");
            }
            this.hideMessage();
          }
          this.loading = false;
        },
        error => {
          this.openModal('errorMessage');
          this.hideMessage();
        }
      );
    } else {
      this.showMessage("No existen productos en el pedido.", "info", true);
    }
  }

  public toPrintKitchen(printerSelected: Printer): void {

    this.loading = true;
    this.showMessage("Imprimiendo, Espere un momento...", "info", false);

    if (this.movementsOfArticles.length !== 0) {

      this.typeOfOperationToPrint = 'kitchen';

      let datePipe = new DateFormatPipe();
      let decimalPipe = new DecimalPipe('ARS');
      let content: string;

      content =
        '<table>' +
        '<tbody>' +
        '<tr><td colspan="12" align="center"><b><font face="Courier">COCINA</font><td></tr>';
      if (Config.companyName) content += '<tr><td colspan="12" align="center"><b><font face="Courier">' + Config.companyName + '</font><td></tr>';
      content +=
        '<tr><td colspan="12"><font face="Courier" size="2">Nro. Pedido ' + this.transaction.number + '</font></td></tr>' +
        '<tr><td colspan="7"><font face="Courier" size="2">Fecha ' + datePipe.transform(this.transaction.endDate, 'DD/MM/YYYY') + '</font></td>' +
        '<td colspan="5" align="right"><font face="Courier" size="2">Hora ' + datePipe.transform(this.transaction.startDate, 'HH:mm') + '</font></td></tr>';
      if (this.transaction.table) content += '<tr><td colspan="4"><font face="Courier" size="2">Mesa: ' + this.transaction.table.description + '</font></td>';
      if (this.transaction.employeeClosing) content += '<td colspan="8" align="right"><font face="Courier" size="2">Mozo: ' + this.transaction.employeeClosing.name + '</font></td></tr>';
      content += '<tr><td colspan="12"><hr></td></tr>';
      for (let movementOfArticle of this.kitchenArticlesToPrint) {
        content +=
          '<tr>' +
          '<td colspan="3"><font face="Courier" size="2">' + (movementOfArticle.amount - movementOfArticle.printed) + '</font></td>' +
          '<td colspan="9"><font face="Courier" size="2">' + movementOfArticle.description + '</font></td>' +
          '</tr>';
        if (movementOfArticle.notes) {
          content +=
            '<tr>' +
            '<td colspan="12"><font face="Courier" size="1"><em>' + movementOfArticle.notes + '<em></font></td>' +
            '</tr>';
        }
      }

      content +=
        '</tbody>' +
        '</table>';

      let fileName: string = 'pedido-' + this.transaction.origin + '-' + this.transaction.number;

      let print = new Print();
      print.fileName = fileName;
      print.content = content;
      print.printer = printerSelected;
      this.printSelected = print;

      this._printService.toPrint(print).subscribe(
        result => {
          if (result.message !== "ok") {
            this.showMessage(result.message, "info", true);
          } else {
            for (let movementOfArticle of this.kitchenArticlesToPrint) {
              movementOfArticle.printed = movementOfArticle.amount;
              this.updateMovementOfArticle(movementOfArticle);
            }
            if (this.posType === 'resto') {
              this.changeStateOfTable(TableState.Busy, true);
            } else {
              this.back();
            }
          }
          this.loading = false;
          this.hideMessage();
        },
        error => {
          this.openModal('errorMessage');
          this.hideMessage();
        }
      );
    } else {
      this.showMessage("No existen productos en el pedido.", "info", true);
    }
  }

  public updateMovementOfArticle(movementOfArticle: MovementOfArticle) {

    this.loading = true;

    this._movementOfArticleService.updateMovementOfArticle(movementOfArticle).subscribe(
      result => {
        if (!result.movementOfArticle) {
          this.showMessage(result.message, "info", true);
        } else {
          this.updatePrices();
          //No anulamos el mensaje para que figuren en el pos, si es que da otro error.
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
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
    this.alertMessage = "";
  }
}