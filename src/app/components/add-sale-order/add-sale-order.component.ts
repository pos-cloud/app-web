//Angular
import { Component, OnInit, ElementRef, ViewChild, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

//Paquetes de terceros
import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

//Modelos
import { Transaction, TransactionState } from './../../models/transaction';
import { TransactionType } from './../../models/transaction-type';
import { Article, ArticleType } from './../../models/article';
import { MovementOfArticle } from './../../models/movement-of-article';
import { Table, TableState } from './../../models/table';
import { Employee } from './../../models/employee';
import { Category } from './../../models/category';
import { Room } from './../../models/room';
import { Print } from './../../models/print';
import { Printer, PrinterType } from './../../models/printer';
import { PaymentMethod } from './../../models/payment-method';

//Servicios
import { MovementOfArticleService } from './../../services/movement-of-article.service';
import { TransactionService } from './../../services/transaction.service';
import { TransactionTypeService } from './../../services/transaction-type.service';
import { TableService } from './../../services/table.service';
import { TurnService } from './../../services/turn.service';
import { PrintService } from './../../services/print.service';
import { PrinterService } from './../../services/printer.service';
import { PaymentMethodService } from './../../services/payment-method.service';

//Componentes
import { ListCompaniesComponent } from './../list-companies/list-companies.component';

//Pipes
import { DatePipe, DecimalPipe } from '@angular/common'; 

@Component({
  selector: 'app-add-sale-order',
  templateUrl: './add-sale-order.component.html',
  styleUrls: ['./add-sale-order.component.css'],
  providers: [NgbAlertConfig, DatePipe, DecimalPipe]
})

export class AddSaleOrderComponent implements OnInit {

  public transaction: Transaction;
  public alertMessage: string = "";
  public movementOfArticle: MovementOfArticle;
  public movementsOfArticles: MovementOfArticle[];
  public paymentMethods: PaymentMethod[];
  public paymentMethodSelected: PaymentMethod;
  public printers: Printer[];
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
  @ViewChild('content') content:ElementRef;
  @ViewChild('contentCancelOrder') contentCancelOrder:ElementRef;
  @ViewChild('contentDiscount') contentDiscount:ElementRef;
  @ViewChild('contentPayment') contentPayment: ElementRef;
  @ViewChild('contentPrinters') contentPrinters: ElementRef;
  @ViewChild('contentMessage') contentMessage: ElementRef;
  public discountPorcent: number = 0.00;
  public discountAmount: number = 0.00;
  public isNewItem: boolean;
  public paymentAmount: number = 0.00;
  public paymentChange: string = '0.00';
  public typeOfOperationToPrint: string;
  public kitchenArticlesToPrint: MovementOfArticle[];
  public barArticlesToPrint: MovementOfArticle[];

  public formErrors = {
    'description':'',
    'amount': '',
    'salePrice': ''
  };

  public validationMessages = {
    'description': {
      'required':       'Este campo es requerido.'
    },
    'amount': {
      'required':       'Este campo es requerido.'
    },
    'salePrice': {
      'required':       'Este campo es requerido.'
    }
  };

  public formErrorsDiscount = {
    'amount': '',
    'porcent': ''
  };

  public validationMessagesDiscount = {
    'amount': {
      'required':       'Este campo es requerido.'
    },
    'porcent': {
      'required':       'Este campo es requerido.'
    }
  };

  public formErrorsPayment = {
    'amount': '',
    'cashChange': '',
    'paymentMethod': '',
    'totalPrice': ''
  };

  public validationMessagesPayment = {
    'amount': {
      'required':       'Este campo es requerido.'
    },
    'cashChange': {
      'required':       'Este campo es requerido.'
    },
    'paymentMethod': {
      'required': 'Este campo es requerido.'
    },
    'totalPrice': {
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
    public _paymentMethodService: PaymentMethodService,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal,
    public _printerService: PrinterService
  ) {
    this.transaction = new Transaction();
    this.transaction.paymentMethod = null;
    // this.transaction.employee = new Employee();
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

    this.getPrinters();

    if (this.posType === "resto") {
      this.transaction.table = new Table();
      this.table = new Table();
      let tableId = pathLocation[6];
      if (tableId !== undefined) {
        this.getOpenTransactionByTable(tableId);
      }
    } else if (this.posType === "mostrador") {
      let transactionId = pathLocation[4];
      if (transactionId !== undefined) {
        this.getTransaction(transactionId);
      } else {
        this.getTransactionTypeSaleOrder();
      }
    }

    this.getPaymentMethods();
    this.buildFormPayment();
  }

  public getTransactionTypeSaleOrder(): void {

    this._transactionTypeService.getTransactionTypeSaleOrder().subscribe(
      result => {
        if (!result.transactionTypes) {
          this.showMessage(result.message, "info", true);
        } else {
          this.transaction.type = result.transactionTypes[0];
          this.getLastSaleOrder();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
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

        let transactionState: TransactionState;

        if (!result.transactions) {
          this.hideMessage();
          this.getTable(tableId);
        } else {
          this.hideMessage();
          this.transaction = result.transactions[0];
          this.discountAmount = this.transaction.discount;
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
          this.discountAmount = this.transaction.discount;
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

  public getTable(id: string): void  {
    
    this.loading = true;
    
    this._tableService.getTable(id).subscribe(
      result => {
        if(!result.table) {
          this.showMessage(result.message, "info", true); 
        } else {
          this.hideMessage();
          this.table = result.table;
          this.transaction.table = this.table;
          this.transaction.employee = this.table.employee;
          this.getOpenTurn();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getOpenTurn(): void {
    
    this.loading = true;
    
    this._turnService.getOpenTurn(this.transaction.employee._id).subscribe(
      result => {
        if(!result.turns) {
          this.showMessage(result.message, "info", true);
        } else {
          this.transaction.turn = result.turns[0];
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getLastSaleOrder(): void {

    this.loading = true;
    
    this._transactionService.getLastTransactionByType(this.transaction.type).subscribe(
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

  public buildForm(): void {

    this.amountOfItemForm = this._fb.group({
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
      'amount': [this.discountAmount, [
           Validators.required
        ]
      ],
      'porcent': [this.discountPorcent, [
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

  public buildFormPayment(): void {

    this.paymentForm = this._fb.group({
      'totalPrice': [this.transaction.totalPrice, [
           Validators.required
        ]
      ],
      'amount': [this.paymentAmount, [
           Validators.required
        ]
      ],
      'cashChange': [this.paymentChange, [
           Validators.required
        ]
      ],
      'paymentMethod': [this.transaction.paymentMethod, [
          Validators.required
        ]
      ]
    });

    this.paymentForm.valueChanges
      .subscribe(data => this.onValueChangedPayment(data));

    this.onValueChangedPayment();
  }

  public onValueChangedPayment(data?: any): void {

    if (!this.paymentForm) { return; }
    const form = this.paymentForm;

    for (const field in this.formErrorsPayment) {
      this.formErrorsPayment[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessagesPayment[field];
        for (const key in control.errors) {
          this.formErrorsPayment[field] += messages[key] + ' ';
        }
      }
    }
    
    this.paymentChange = (this.paymentForm.value.amount -this.paymentForm.value.totalPrice).toFixed(2);
  }

  public addTransaction(): void {
    
    this.loading = true;
    this._transactionService.saveTransaction(this.transaction).subscribe(
      result => {
        if(!result.transaction) {
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

  public updateTransaction(): void {
    
    this.loading = true;
    
    this._transactionService.updateTransaction(this.transaction).subscribe(
      result => {
        if(!result.transaction) {
          this.showMessage(result.message, "info", true);
        } else {
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

  public showArticlesOfCategory(category: Category): void {
    
    this.categorySelected = category;
    this.areArticlesVisible = true;
    this.areCategoriesVisible = false;
  }

  public close() {


    this.typeOfOperationToPrint = 'item';
    for(let movementOfArticle of this.movementsOfArticles) {
      if(movementOfArticle.type === ArticleType.Bar && !movementOfArticle.printed) {
        this.barArticlesToPrint.push(movementOfArticle);
      }
      if (movementOfArticle.type === ArticleType.Kitchen && !movementOfArticle.printed) {
        this.kitchenArticlesToPrint.push(movementOfArticle);
      }
    }
    
    if(this.barArticlesToPrint.length !== 0) {
      this.typeOfOperationToPrint = "bar";
      this.openModal('printers');
    } 
    
    if (this.kitchenArticlesToPrint.length !== 0) {
        this.typeOfOperationToPrint = "kitchen";
        this.openModal('printers');
    }

    if (this.barArticlesToPrint.length === 0 && this.kitchenArticlesToPrint.length === 0) {
      if(this.posType === "resto") {
        this.changeStateOfTable(TableState.Busy, true);
      } else if (this.posType === "mostrador") {
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
          if(closed) {
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
  
  public addItem(itemData?: MovementOfArticle): void {
    
    this.buildForm();

    let article: Article = new Article();
    if(itemData) {
      this.isNewItem = false;
      this.movementOfArticle = itemData;
      this.movementOfArticle.article = article;
      this.movementOfArticle.article._id = itemData._id;
      this.movementOfArticle.amount = 1;
      this.amountOfItemForm.setValue({
        'description': this.movementOfArticle.description,
        'amount': this.movementOfArticle.amount,
        'salePrice': this.movementOfArticle.salePrice,
        'notes':''
      });
      this.movementOfArticle.transaction = this.transaction;
      this.openModal('add_item');
    } else {
      this.isNewItem = true;
      this.movementOfArticle = new MovementOfArticle();
      this.amountOfItemForm.setValue({
        'description':this.movementOfArticle.description,
        'amount':this.movementOfArticle.amount,
        'salePrice': this.movementOfArticle.salePrice,
        'notes':''
      });
      this.movementOfArticle.transaction = this.transaction;
      this.openModal('add_new_item');
    }
  }

  public openModal(op: string): void {

    let modalRef;

      switch(op) {
        case 'add_item':

          modalRef = this._modalService.open(this.content, { size: 'lg' }).result.then((result) => {
            if(result  === "add_item"){
              this.confirmAmount();
            }
          }, (reason) => {
            
          });
          break;
        case 'add_new_item':

          modalRef = this._modalService.open(this.content, { size: 'lg' }).result.then((result) => {
            if(result  === "add_item"){
              this.confirmAmount();
            }
          }, (reason) => {
            
          });
          break;
        case 'apply_discount' :

          this.buildFormDiscount();

          if(this.movementsOfArticles.length !== 0) {
            modalRef = this._modalService.open(this.contentDiscount, { size: 'lg' }).result.then((result) => {
              if(result  === "apply_discount"){

                this.discountPorcent = this.discountForm.value.porcent;
                this.discountAmount = this.discountForm.value.amount;
                this.updatePrices();
              }
            }, (reason) => {
              
            });
          } else {
            this.showMessage("No existen artículos en el pedido.", "info", true);
            this.loading = false;
          }
          break;
        case 'cancel_transaction' :
        
          modalRef = this._modalService.open(this.contentCancelOrder, { size: 'lg' }).result.then((result) => {
            if(result  === "cancel_transaction"){
              this.transaction.state = TransactionState.Canceled;
              this.transaction.endDate = new Date();
              this.updateTransaction();
              if (this.posType === "resto") {
                this.table.employee = null;
                this.changeStateOfTable(TableState.Available, true);
              } else if (this.posType === "mostrador") {
                this.back();
              }
            }
          }, (reason) => {
            
          });
          break;
        case 'add_client' :
        
          modalRef = this._modalService.open(ListCompaniesComponent, { size: 'lg' });
          modalRef.componentInstance.userType = this.userType;
          modalRef.result.then((result) => {
            if(result){
              this.transaction.company = result;
              this.updateTransaction();
            }
          }, (reason) => {
            
          });
          break;
        case 'charge' :

          this.typeOfOperationToPrint = "charge";
          if(this.movementsOfArticles.length !== 0) {
            
            this.paymentForm.setValue({
              'totalPrice': parseFloat("" + this.transaction.totalPrice).toFixed(2),
              'amount': parseFloat("" + this.transaction.totalPrice).toFixed(2),
              'cashChange': parseFloat(this.paymentChange).toFixed(2),
              'paymentMethod': this.transaction.paymentMethod
            });
            
            modalRef = this._modalService.open(this.contentPayment, { size: 'lg' }).result.then((result) => {
              if (result === "charge") {
                this.openModal('printers');
              }
            }, (reason) => {

            });
          } else {
            this.showMessage("No existen artículos en el pedido.", "info", true);
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
              this.finishCharge();
            } else if (this.typeOfOperationToPrint === "bill") {
              this.changeStateOfTable(TableState.Pending, true);
            }
          }
          break;
        case 'errorMessage':
          modalRef = this._modalService.open(this.contentMessage, { size: 'lg' }).result.then((result) => {
            if (result !== "cancel" && result !== "") {
              this.finishCharge();
            }
          }, (reason) => {

          });
          break;
        default : ;
    };
  }

  public getPaymentMethods(): void {
    
    this.loading = true;

    this._paymentMethodService.getPaymentMethods().subscribe(
      result => {
        if (!result.paymentMethods){
          this.showMessage(result.message, "info", true);
        } else {  
          this.paymentMethodSelected = result.paymentMethods[0];
          this.paymentMethods = result.paymentMethods;
          this.transaction.paymentMethod = this.paymentMethods[0];
          this.paymentForm.setValue({
            'totalPrice': parseFloat("" + this.transaction.totalPrice).toFixed(2),
            'amount': parseFloat("" + this.transaction.totalPrice).toFixed(2),
            'cashChange': parseFloat(this.paymentChange).toFixed(2),
            'paymentMethod': this.transaction.paymentMethod._id
          });
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public countPrinters(): number {
    
    let numberOfPrinters;

    if (this.printers != undefined) {
      for (let printer of this.printers) {
        if(this.typeOfOperationToPrint === 'charge' && printer.type === PrinterType.Counter) {
          this.printersAux.push(printer);
          numberOfPrinters++;
        } else if (this.typeOfOperationToPrint === 'bill' && printer.type === PrinterType.Counter) {
          this.printersAux.push(printer);
          numberOfPrinters++;
        } else if (this.typeOfOperationToPrint === 'bar' && printer.type === PrinterType.Bar) {
          this.printersAux.push(printer);
          numberOfPrinters++;
        } else if (this.typeOfOperationToPrint === 'kitchen' && printer.type === PrinterType.Kitchen) {
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

    switch (this.typeOfOperationToPrint) {
      case 'charge':
        this.assignOrigin(printer.origin);
        this.toPrintCharge(printer);
        break;
      case 'bill':
        this.toPrintBill(printer);
        break;
      case 'bar':
        this.toPrintBar(printer);
        break;
      case 'kitchen':
        this.toPrintKitchen(printer);
        break;
      default:
        this.showMessage("No se reconoce la operación de impresión.", "danger", false);
        break;
    }
  }

  public assignOrigin(origin: number) {
    this.transaction.origin = origin;
  }

  public setPrintBill(): void {
    if (this.movementsOfArticles.length !== 0) {
      this.typeOfOperationToPrint = 'bill';
      this.openModal('printers');
    } else {
      this.showMessage("No existen artículos en el pedido.", "info", true);
      this.loading = false;
    }
  }

  public finishCharge() {
    this.transaction.endDate = new Date();
    this.transaction.date = this.transaction.endDate;
    this.transaction.state = TransactionState.Closed;
    this.transaction.cashChange = this.paymentForm.value.cashChange;
    this.transaction.paymentMethod = this.paymentForm.value.paymentMethod;

    this.updateTransaction();
    this.typeOfOperationToPrint = 'charge';
    if (this.posType === "resto") {
      this.table.employee = null;
      this.changeStateOfTable(TableState.Available, true);
    } else {
      this.back();
    }
  }

  public back(): void {
    if (this.posType === "resto") {
      this._router.navigate(['/pos/resto/salones/' + this.transaction.table.room + '/mesas']);
    } else if (this.posType === "mostrador") {
      this._router.navigate(['/pos/mostrador']);
    }
  }

  public confirmAmount(): void {

    this.movementOfArticle.description = this.amountOfItemForm.value.description;
    this.movementOfArticle.amount = this.amountOfItemForm.value.amount;
    this.movementOfArticle.salePrice = this.amountOfItemForm.value.salePrice;
    this.movementOfArticle.notes = this.amountOfItemForm.value.notes;
    this.movementOfArticle.totalPrice = this.movementOfArticle.amount * this.movementOfArticle.salePrice;
    this.movementOfArticle.printed = false;
    this.saveMovementOfArticle();
  }

  public applyDiscount(): void {
    
    if( this.discountPorcent > 0 && 
        this.discountPorcent <= 100 && 
        this.discountPorcent !== null && 
        (this.discountAmount === 0 || this.discountAmount === null)){

      this.transaction.discount = parseFloat(""+this.transaction.subtotalPrice) * parseFloat(""+this.discountForm.value.porcent) / 100;
      this.hideMessage();
    } else if(( this.discountPorcent === 0 || 
                this.discountPorcent === null) && 
                this.discountAmount > 0  && 
                this.discountAmount <= this.transaction.subtotalPrice  &&
                this.discountAmount !== null){

      this.transaction.discount = this.discountAmount;
      this.hideMessage();
    } else if(this.discountAmount !== 0 && this.discountPorcent !== 0){
      
      this.transaction.discount = 0;

      this.showMessage("Solo debe cargar un solo descuento.", "info", true);
    } else {
      this.hideMessage();
    }

    if(this.transaction.discount != 0) {
      this.transaction.totalPrice = parseFloat(""+this.transaction.subtotalPrice) - parseFloat(""+this.transaction.discount);
    } else {
      this.transaction.totalPrice = this.transaction.subtotalPrice;
    }
    
    this.updateTransaction();
  }

  public saveMovementOfArticle(): void {

    this.loading = true;
    console.log(this.movementOfArticle);
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
    this.amountOfItemForm.setValue({
            'description': this.amountOfItemForm.value.description,
            'amount': this.amountOfItemForm.value.amount + 1,
            'salePrice': this.amountOfItemForm.value.salePrice,
            'notes': this.amountOfItemForm.value.notes
    });
  }

  public subtractAmount(): void {
    if (this.amountOfItemForm.value.amount > 1) {
      this.amountOfItemForm.setValue({
              'description':this.amountOfItemForm.value.description,
              'amount': this.amountOfItemForm.value.amount - 1,
              'salePrice': this.amountOfItemForm.value.salePrice,
              'notes': this.amountOfItemForm.value.notes
      });
    } else {
      this.amountOfItemForm.setValue({
              'description':this.amountOfItemForm.value.description,
              'amount': 1,
              'salePrice': this.amountOfItemForm.value.salePrice,
              'notes': this.amountOfItemForm.value.notes
      });
    }
  }

  public getMovementsOfTransaction(): void {
    
    this.loading = true;
    
    this._movementOfArticleService.getMovementsOfTransaction(this.transaction._id).subscribe(
        result => {
					if(!result.movementsOfArticles) {
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

  public deleteMovementOfArticle(movementOfArticleId: string): void {

    this.loading = true;
    
    this._movementOfArticleService.deleteMovementOfArticle(movementOfArticleId).subscribe(
      result => {
        this.getMovementsOfTransaction();
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

   public updatePrices(): void {

      this.transaction.subtotalPrice = 0;

      for(let movementOfArticle of this.movementsOfArticles) {
        this.transaction.subtotalPrice = parseFloat(""+this.transaction.subtotalPrice) + parseFloat(""+movementOfArticle.totalPrice);
      }
      
      this.applyDiscount();
   }

   public toPrintBill(printerSelected: Printer): void {

    this.loading = true;
    
    if(this.movementsOfArticles.length !== 0) {
      let datePipe = new DatePipe('es-AR');
      let decimalPipe = new DecimalPipe('ARS');
      let content: string;
      content =
        'CONFITERIA LA PALMA - CASA DE TE\n' +
        'CUIT Nro.: 30-61432547-6\n' +
        '25 de Mayo 2028 - San Francisco - Córdoba\n' +
        'Tel: (03564) 424423\n' +
        'P.V. Nro.: ' + decimalPipe.transform(this.transaction.origin, '4.0-0').replace(/,/g, "") + '\n' +
        'Nro. T.            ' + decimalPipe.transform(this.transaction.number, '8.0-0').replace(/,/g, "") + '\n' +
        'Fecha ' + datePipe.transform(this.transaction.startDate, 'dd/MM/yyyy')  + '  Hora '  + datePipe.transform(this.transaction.startDate, 'HH:mm')  + '\n' +
        'Mesa: ' + this.transaction.table.description + '\n' +
        'Empleado: ' + this.transaction.employee.name + '\n\n';
        if(this.transaction.company) {
          content += 'Cliente: '+this.transaction.company.name+'\n\n';
        } else {
          content += 'Cliente: Consumidor Final\n\n';
        }
        content += 'DESC.			CANT	MONTO\n' +
        '----------------------------------------\n';
        for (let movementOfArticle of this.movementsOfArticles) {
          content += movementOfArticle.description + '    ' + movementOfArticle.amount + '      '	+ decimalPipe.transform(movementOfArticle.salePrice, '1.2-2') + '\n';
        }
        content += '----------------------------------------\n' +
        'Subtotal:				 ' + decimalPipe.transform(this.transaction.subtotalPrice, '1.2-2') + '\n' +
        'Descuento:				-' + decimalPipe.transform(this.transaction.discount, '1.2-2') + '\n' +
        'Total:					 '+ decimalPipe.transform(this.transaction.totalPrice, '1.2-2') + '\n\n' +
        'Ticket no válido como factura. Solicite su factura en el mostrador.\n\n' +
        '----Gracias por su visita.----\n\n\n';

      let fileName: string = 'pedido-' + this.transaction.origin + '-' + this.transaction.number;
      
      let print: Print = new Print();
      print.fileName = fileName;
      print.content = content;
      print.printer = printerSelected;
      this._printService.toPrint(print).subscribe(
        result => {
          this.printersAux = new Array();
          if(result.message === 'ok'){
            if (this.posType === 'resto') {
              this.changeStateOfTable(TableState.Pending, true);
            }
          } else {
            this.showMessage("Ha ocurrido un error en el servidor", "danger", false);
          }
          this.loading = false;
        },
        error => {
          // this.openModal("errorMessage");
          this.loading = false;
        }
      );
    } else {
      this.showMessage("No existen artículos en el pedido.", "info", true);
      this.loading = false;
    }
  }

  public toPrintCharge(printerSelected: Printer): void {

    this.loading = true;
    
    if(this.movementsOfArticles.length !== 0) {
      let datePipe = new DatePipe('es-AR');
      let decimalPipe = new DecimalPipe('ARS');
      let content: string;
      content =
        'CONFITERIA LA PALMA - CASA DE TE\n' +
        'CUIT Nro.: 30-61432547-6\n' +
        '25 de Mayo 2028 - San Francisco - Córdoba\n' +
        'Tel: (03564) 424423\n' +
        'P.V. Nro.: ' + decimalPipe.transform(this.transaction.origin, '4.0-0').replace(/,/g, "") + '\n' +
        'Nro. T.            ' + decimalPipe.transform(this.transaction.number, '8.0-0').replace(/,/g, "") + '\n' +
        'Fecha ' + datePipe.transform(this.transaction.endDate, 'dd/MM/yyyy')  + '  Hora '  + datePipe.transform(this.transaction.endDate, 'HH:mm')  + '\n' +
        'Mesa: ' + this.transaction.table.description + '\n' +
        'Empleado: ' + this.transaction.employee.name + '\n\n';
        if(this.transaction.company) {
          content += 'Cliente: '+this.transaction.company.name+'\n\n';
        } else {
          content += 'Cliente: Consumidor Final\n\n';
        }
        content += 'DESC.			CANT	MONTO\n' +
        '----------------------------------------\n';
        for (let movementOfArticle of this.movementsOfArticles) {
          content += movementOfArticle.description + '    ' + movementOfArticle.amount + '      '	+ decimalPipe.transform(movementOfArticle.salePrice, '1.2-2') + '\n';
        }
        content += '----------------------------------------\n' +
        'Subtotal:				 ' + decimalPipe.transform(this.transaction.subtotalPrice, '1.2-2') + '\n' +
        'Descuento:				-' + decimalPipe.transform(this.transaction.discount, '1.2-2') + '\n' +
        'Total:					 '+ decimalPipe.transform(this.transaction.totalPrice, '1.2-2') + '\n' +
          'Su pago:					 ' + decimalPipe.transform(parseFloat("" + this.transaction.cashChange) - parseFloat("" + this.transaction.totalPrice), '1.2-2') + '\n' +
        'Su vuelto:					 '+ decimalPipe.transform(this.transaction.cashChange, '1.2-2') + '\n\n' +
        'Ticket no válido como factura. Solicite su factura en el mostrador.\n\n' +
        '----Gracias por su visita.----\n\n\n';

      let fileName: string = 'pedido-' + this.transaction.origin + '-' + this.transaction.number;
      
      let print: Print = new Print();
      print.fileName = fileName;
      print.content = content;
      print.printer = printerSelected;
      
      this._printService.toPrint(print).subscribe(
        result => {
          this.printersAux = new Array();
          if(result.message === 'ok'){
            this.finishCharge();
          } else {
            this.showMessage("Ha ocurrido un error en el servidor", "danger", false);
          }
          this.loading = false;
        },
        error => {
          // this.openModal("errorMessage");
          this.loading = false;
        }
      );
    } else {
      this.showMessage("No existen artículos en el pedido.", "info", true);
      this.loading = false;
    }
  }

  public toPrintBar(printerSelected: Printer): void {

    this.loading = true;
    
    if (this.barArticlesToPrint.length !== 0) {
      let datePipe = new DatePipe('es-AR');
      let decimalPipe = new DecimalPipe('ARS');
      let content: string;
      content =
        'Fecha ' + datePipe.transform(new Date(), 'dd/MM/yyyy') + '  Hora ' + datePipe.transform(new Date(), 'HH:mm') + '\n' +
        'Mesa: ' + this.transaction.table.description + '\n' +
        'Empleado: ' + this.transaction.employee.name + '\n\n';

      content += 'DESCRIPCION.			CANTIDAD\n' +
        '----------------------------------------\n';
      for (let barArticleToPrint of this.barArticlesToPrint) {
        content += barArticleToPrint.description + '    ' + barArticleToPrint.amount + '\n';
        content += barArticleToPrint.observation + '\n';
      }

      let fileName: string = 'pedido-' + this.transaction.origin + '-' + this.transaction.number;

      let print: Print = new Print();
      print.fileName = fileName;
      print.content = content;
      print.printer = printerSelected;
      this._printService.toPrint(print).subscribe(
        result => {
          this.printersAux = new Array();
          if (result.message === 'ok') {
            for (let movementOfArticle of this.barArticlesToPrint) {
              movementOfArticle.printed = true;
              this.updateMovementOfArticle(movementOfArticle);
            }
            if(this.kitchenArticlesToPrint.length === 0) {
              if (this.posType === 'resto') {
                this.changeStateOfTable(TableState.Pending, true);
              } else if (this.posType === 'resto') {
                this.back();
              }
            } else {
              this.typeOfOperationToPrint = "kitchen";
              this.openModal("printers");
            }
          } else {
            this.showMessage("Ha ocurrido un error en el servidor.", "danger", false);
          }
          this.loading = false;
        },
        error => {
          // this.openModal("errorMessage");
          this.loading = false;
        }
      );
    } else {
      this.showMessage("No existen artículos en el pedido", "info", true); 
      this.loading = false;
    }
  }

  public toPrintKitchen(printerSelected: Printer): void {

    this.loading = true;
    
    if (this.movementsOfArticles.length !== 0) {
      let datePipe = new DatePipe('es-AR');
      let decimalPipe = new DecimalPipe('ARS');
      let content: string;
      content =
        'Fecha ' + datePipe.transform(new Date(), 'dd/MM/yyyy') + '  Hora ' + datePipe.transform(new Date(), 'HH:mm') + '\n' +
        'Mesa: ' + this.transaction.table.description + '\n' +
        'Empleado: ' + this.transaction.employee.name + '\n\n';

      content += 'DESCRIPCION.			CANTIDAD\n' +
        '----------------------------------------\n';
      for (let kitchenArticleToPrint of this.kitchenArticlesToPrint) {
        content += kitchenArticleToPrint.description + '    ' + kitchenArticleToPrint.amount + '\n';
        content += kitchenArticleToPrint.observation + '\n';
      }

      let fileName: string = 'pedido-' + this.transaction.origin + '-' + this.transaction.number;

      let print: Print = new Print();
      print.fileName = fileName;
      print.content = content;
      print.printer = printerSelected;
      this._printService.toPrint(print).subscribe(
        result => {
          this.printersAux = new Array();
          if (result.message === 'ok') {
            for (let movementOfArticle of this.kitchenArticlesToPrint) {
              movementOfArticle.printed = true;
              this.updateMovementOfArticle(movementOfArticle);
            }
            if (this.posType === 'resto') {
              this.changeStateOfTable(TableState.Pending, true);
            } else if (this.posType === 'resto') {
              this.back();
            }
          } else {
            this.showMessage("Ha ocurrido un error en el servidor", "danger", false);
          }
          this.loading = false;
        },
        error => {
          // this.openModal("errorMessage");
          this.loading = false;
        }
      );
    } else {
      this.showMessage("No existen artículos en el pedido", "info", true);
      this.loading = false;
    }
  }

  public updateMovementOfArticle(movementOfArticle: MovementOfArticle) {

    this.loading = true;
    
    this._movementOfArticleService.updateMovementOfArticle(movementOfArticle).subscribe(
      result => {
        if (!result.movementOfArticle) {
          this.showMessage(result.message, "info", true); 
          this.loading = false;
        } else {
          //No anulamos el mensaje para que figuren en el pos, si es que da otro error.
        }
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

  public hideMessage():void {
    this.alertMessage = "";
  }
}