//Angular
import { Component, OnInit, ElementRef, ViewChild, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

//Paquetes de terceros
import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

//Modelos
import { SaleOrder, SaleOrderState } from './../../models/sale-order';
import { Article, ArticleType } from './../../models/article';
import { MovementOfArticle } from './../../models/movement-of-article';
import { Table, TableState } from './../../models/table';
import { Employee } from './../../models/employee';
import { Category } from './../../models/category';
import { Room } from './../../models/room';
import { Print } from './../../models/print';
import { Printer, PrinterType } from './../../models/printer';

//Servicios
import { MovementOfArticleService } from './../../services/movement-of-article.service';
import { SaleOrderService } from './../../services/sale-order.service';
import { TableService } from './../../services/table.service';
import { TurnService } from './../../services/turn.service';
import { PrintService } from './../../services/print.service';
import { PrinterService } from './../../services/printer.service';

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

  public saleOrder: SaleOrder;
  public alertMessage: string = "";
  public movementOfArticle: MovementOfArticle;
  public movementsOfArticles: MovementOfArticle[];
  public printers: Printer[];
  public printersAux: Printer[];  //Variable utilizada para guardar las impresoras de una operación determinada
  public amountOfItemForm: FormGroup;
  public discountForm: FormGroup;
  public paymentForm: FormGroup;
  public areMovementsOfArticlesEmpty: boolean = true;
  public userType: string;
  public table: Table;
  public tableId: string;
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
    'salePrice':''

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
    'cashChange': ''
  };

  public validationMessagesPayment = {
    'amount': {
      'required':       'Este campo es requerido.'
    },
    'cashChange': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    public _fb: FormBuilder,
    public _saleOrderService: SaleOrderService,
    public _movementOfArticleService: MovementOfArticleService,
    public _tableService: TableService,
    public _turnService: TurnService,
    public _printService: PrintService,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal,
    public _printerService: PrinterService
  ) {
    this.saleOrder = new SaleOrder();
    this.saleOrder.employee = new Employee();
    this.saleOrder.table = new Table();
    this.table = new Table();
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
    if(this.tableId === undefined) {
      this.tableId = pathLocation[6];
    }

    this.getPrinters();
  }

  public getPrinters(): void {

    this.loading = true;

    this._printerService.getPrinters().subscribe(
      result => {
        if (!result.printers) {
          this.showMessage(result.message, "info", true);
          this.printers = null;
        } else {
          this.hideMessage();
          this.printers = result.printers;
          if (this.tableId === undefined) {
            this.getOpenSaleOrderByTable();
          }
          this.buildForm();
          this.buildFormDiscount();
          this.buildFormPayment();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getOpenSaleOrderByTable(): void {

    this.loading = true;
    
    this._saleOrderService.getOpenSaleOrderByTable(this.tableId).subscribe(
      result => {

        let saleOrderState: SaleOrderState;

        if (!result.saleOrders) {
          this.hideMessage();
          this.getTable(this.tableId);
        } else {
          this.hideMessage();
          this.saleOrder = result.saleOrders[0];
          this.discountAmount = this.saleOrder.discount;
          this.table = this.saleOrder.table;
          this.getMovementsOfSaleOrder();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getLastSaleOrderByOrigen(): void {
    
    let origin = 0;
    this.loading = true;
    
    this._saleOrderService.getLastSaleOrderByOrigen(origin).subscribe(
      result => {
        let number;
        
        if(result.saleOrders){
          if(result.saleOrders[0] !== undefined) {
            number = result.saleOrders[0].number + 1;
          } else {
            number = 1;
          }
        } else if(result.message = "No se encontraron pedidos") {
          number = 1;
        } else {
          number = 0;
        }

        if(number != 0) {

          this.saleOrder.number = number;
          this.addSaleOrder();
        } else {
          this.showMessage("Ha ocurrido un error en obtener el último pedido", "danger", false);
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
          this.saleOrder.table = this.table;
          this.saleOrder.employee = this.table.employee;
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
    
    this._turnService.getOpenTurn(this.saleOrder.employee._id).subscribe(
      result => {
        if(!result.turns) {
          this.showMessage(result.message, "info", true);
        } else {
          this.saleOrder.turn = result.turns[0];
          this.getLastSaleOrderByOrigen();
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
      'totalPrice': [this.saleOrder.totalPrice, [
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

  public addSaleOrder(): void {
    
    this.loading = true;
    
    this._saleOrderService.saveSaleOrder(this.saleOrder).subscribe(
      result => {
          if(!result.saleOrder) {
            this.showMessage(result.message, "info", true);
          } else {
            this.hideMessage();
            this.saleOrder = result.saleOrder;
            this.changeStateOfTable(TableState.Busy, false);
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public updateSaleOrder(): void {
    
    this.loading = true;
    
    this._saleOrderService.updateSaleOrder(this.saleOrder).subscribe(
      result => {
        if(!result.saleOrder) {
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

  public closeTable() {

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
      this.changeStateOfTable(TableState.Busy, true);
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
            this.backToRooms();
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
      this.movementOfArticle.saleOrder = this.saleOrder;
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
      this.movementOfArticle.saleOrder = this.saleOrder;
      this.openModal('add_new_item');
    }
  }

  public openModal(op: string): void {

    let modalRef;

      switch(op) {
        case 'add_item' :
          modalRef = this._modalService.open(this.content, { size: 'lg' }).result.then((result) => {
            if(result  === "add_item"){
              this.confirmAmount();
            }
          }, (reason) => {
            
          });
          break;
        case 'add_new_item' :
          modalRef = this._modalService.open(this.content, { size: 'lg' }).result.then((result) => {
            if(result  === "add_item"){
              this.confirmAmount();
            }
          }, (reason) => {
            
          });
          break;
        case 'apply_discount' :
        
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
            this.showMessage("No existen artículos en el pedido.", "danger", false);
            this.loading = false;
          }
          break;
        case 'cancel_order' :
        
          modalRef = this._modalService.open(this.contentCancelOrder, { size: 'lg' }).result.then((result) => {
            if(result  === "cancel_order"){
              this.saleOrder.state = SaleOrderState.Canceled;
              this.saleOrder.endDate = new Date();
              this.updateSaleOrder();
              this.table.employee = null;
              this.changeStateOfTable(TableState.Available, true);
            }
          }, (reason) => {
            
          });
          break;
        case 'add_client' :
        
          modalRef = this._modalService.open(ListCompaniesComponent, { size: 'lg' });
          modalRef.componentInstance.userType = this.userType;
          modalRef.result.then((result) => {
            if(result){
              this.saleOrder.company = result;
              this.updateSaleOrder();
            }
          }, (reason) => {
            
          });
          break;
        case 'charge' :

          if(this.movementsOfArticles.length !== 0) {
            this.paymentForm.setValue({
              'totalPrice' :  parseFloat(""+this.saleOrder.totalPrice).toFixed(2),
              'amount' : parseFloat(""+this.saleOrder.totalPrice).toFixed(2),
              'cashChange' : parseFloat(this.paymentChange).toFixed(2),
            });
            modalRef = this._modalService.open(this.contentPayment, { size: 'lg' }).result.then((result) => {
              if (result === "charge") {
                this.openModal('printers');
              }
            }, (reason) => {

            });
          } else {
            this.showMessage("No existen artículos en el pedido.", "danger", false);
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
          } else if(this.countPrinters() !== 0) {
            this.distributeImpressions(this.printersAux[0]);
          } else {
            this.showMessage("No se encontro impresora para la operación solicitada", "danger", false);
          }
        case 'errorMessage':
          modalRef = this._modalService.open(this.contentMessage, { size: 'lg' }).result.then((result) => {
            if (result !== "cancel" && result !== "") {
              this.finishCharge();
            }
          }, (reason) => {

          });
        default : ;
    };
  }

  public countPrinters(): number {
    
    let numberOfPrinters = 0;

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
    this.saleOrder.origin = origin;
    this.saleOrder.endDate = new Date();
    this.updateSaleOrder();
  }

  public setPrintBill(): void {
    this.typeOfOperationToPrint = 'bill';
    this.openModal('printers');
  }

  public finishCharge() {
    this.saleOrder.state = SaleOrderState.Closed;
    this.saleOrder.cashChange = this.paymentForm.value.cashChange;
    this.updateSaleOrder();
    this.table.employee = null;
    this.typeOfOperationToPrint = 'charge';
    this.changeStateOfTable(TableState.Available, true);
  }

  public backToRooms(): void {
    this._router.navigate(['/pos/resto/salones/'+this.saleOrder.table.room+'/mesas']);
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

      this.saleOrder.discount = parseFloat(""+this.saleOrder.subtotalPrice) * parseFloat(""+this.discountForm.value.porcent) / 100;
      this.hideMessage();
    } else if(( this.discountPorcent === 0 || 
                this.discountPorcent === null) && 
                this.discountAmount > 0  && 
                this.discountAmount <= this.saleOrder.subtotalPrice  &&
                this.discountAmount !== null){

      this.saleOrder.discount = this.discountAmount;
      this.hideMessage();
    } else if(this.discountAmount !== 0 && this.discountPorcent !== 0){
      
      this.saleOrder.discount = 0;

      this.showMessage("Solo debe cargar un solo descuento.", "info", true);
    } else {
      this.hideMessage();
    }

    if(this.saleOrder.discount != 0) {
      this.saleOrder.totalPrice = parseFloat(""+this.saleOrder.subtotalPrice) - parseFloat(""+this.saleOrder.discount);
    } else {
      this.saleOrder.totalPrice = this.saleOrder.subtotalPrice;
    }
    
    this.updateSaleOrder();
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
          this.getMovementsOfSaleOrder();
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

  public getMovementsOfSaleOrder(): void {
    
    this.loading = true;
    
    this._movementOfArticleService.getMovementsOfSaleOrder(this.saleOrder._id).subscribe(
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
        this.getMovementsOfSaleOrder();
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

   public updatePrices(): void {

      this.saleOrder.subtotalPrice = 0;

      for(let movementOfArticle of this.movementsOfArticles) {
        this.saleOrder.subtotalPrice = parseFloat(""+this.saleOrder.subtotalPrice) + parseFloat(""+movementOfArticle.totalPrice);
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
        'P.V. Nro.: ' + decimalPipe.transform(this.saleOrder.origin, '4.0-0').replace(/,/g, "") + '\n' +
        'Nro. T.            ' + decimalPipe.transform(this.saleOrder.number, '8.0-0').replace(/,/g, "") + '\n' +
        'Fecha ' + datePipe.transform(this.saleOrder.endDate, 'dd/MM/yyyy')  + '  Hora '  + datePipe.transform(this.saleOrder.endDate, 'HH:mm')  + '\n' +
        'Mesa: ' + this.saleOrder.table.description + '\n' +
        'Empleado: ' + this.saleOrder.employee.name + '\n\n';
        if(this.saleOrder.company) {
          content += 'Cliente: '+this.saleOrder.company.name+'\n\n';
        } else {
          content += 'Cliente: Consumidor Final\n\n';
        }
        content += 'DESC.			CANT	MONTO\n' +
        '----------------------------------------\n';
        for (let movementOfArticle of this.movementsOfArticles) {
          content += movementOfArticle.description + '    ' + movementOfArticle.amount + '      '	+ decimalPipe.transform(movementOfArticle.salePrice, '1.2-2') + '\n';
        }
        content += '----------------------------------------\n' +
        'Subtotal:				 ' + decimalPipe.transform(this.saleOrder.subtotalPrice, '1.2-2') + '\n' +
        'Descuento:				-' + decimalPipe.transform(this.saleOrder.discount, '1.2-2') + '\n' +
        'Total:					 '+ decimalPipe.transform(this.saleOrder.totalPrice, '1.2-2') + '\n\n' +
        'Ticket no válido como factura. Solicite su factura en el mostrador.\n\n' +
        '----Gracias por su visita.----\n\n\n';

      let fileName: string = 'pedido-' + this.saleOrder.origin + '-' + this.saleOrder.number;
      
      let print: Print = new Print();
      print.fileName = fileName;
      print.content = content;
      print.printer = printerSelected;
      this._printService.toPrint(print).subscribe(
        result => {
          this.printersAux = new Array();
          if(result.message === 'ok'){
            this.changeStateOfTable(TableState.Pending, true);
          } else {
            this.showMessage("Ha ocurrido un error en el servidor", "danger", false);
          }
          this.loading = false;
        },
        error => {
          this.openModal("errorMessage");
          this.loading = false;
        }
      );
    } else {
      this.showMessage("No existen artículos en el pedido.", "danger", false);
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
        'P.V. Nro.: ' + decimalPipe.transform(this.saleOrder.origin, '4.0-0').replace(/,/g, "") + '\n' +
        'Nro. T.            ' + decimalPipe.transform(this.saleOrder.number, '8.0-0').replace(/,/g, "") + '\n' +
        'Fecha ' + datePipe.transform(this.saleOrder.endDate, 'dd/MM/yyyy')  + '  Hora '  + datePipe.transform(this.saleOrder.endDate, 'HH:mm')  + '\n' +
        'Mesa: ' + this.saleOrder.table.description + '\n' +
        'Empleado: ' + this.saleOrder.employee.name + '\n\n';
        if(this.saleOrder.company) {
          content += 'Cliente: '+this.saleOrder.company.name+'\n\n';
        } else {
          content += 'Cliente: Consumidor Final\n\n';
        }
        content += 'DESC.			CANT	MONTO\n' +
        '----------------------------------------\n';
        for (let movementOfArticle of this.movementsOfArticles) {
          content += movementOfArticle.description + '    ' + movementOfArticle.amount + '      '	+ decimalPipe.transform(movementOfArticle.salePrice, '1.2-2') + '\n';
        }
        content += '----------------------------------------\n' +
        'Subtotal:				 ' + decimalPipe.transform(this.saleOrder.subtotalPrice, '1.2-2') + '\n' +
        'Descuento:				-' + decimalPipe.transform(this.saleOrder.discount, '1.2-2') + '\n' +
        'Total:					 '+ decimalPipe.transform(this.saleOrder.totalPrice, '1.2-2') + '\n' +
          'Su pago:					 ' + decimalPipe.transform(parseFloat("" + this.saleOrder.cashChange) - parseFloat("" + this.saleOrder.totalPrice), '1.2-2') + '\n' +
        'Su vuelto:					 '+ decimalPipe.transform(this.saleOrder.cashChange, '1.2-2') + '\n\n' +
        'Ticket no válido como factura. Solicite su factura en el mostrador.\n\n' +
        '----Gracias por su visita.----\n\n\n';

      let fileName: string = 'pedido-' + this.saleOrder.origin + '-' + this.saleOrder.number;
      
      let print: Print = new Print();
      print.fileName = fileName;
      print.content = content;
      print.printer = printerSelected;
      
      this._printService.toPrint(print).subscribe(
        result => {
          this.printersAux = new Array();
          if(result.message === 'ok'){
            this.changeStateOfTable(TableState.Available, true);
          } else {
            this.showMessage("Ha ocurrido un error en el servidor", "danger", false);
          }
          this.loading = false;
        },
        error => {
          this.openModal('errorMessage');
          this.loading = false;
        }
      );
    } else {
      this.showMessage("No existen artículos en el pedido.", "danger", false);
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
        'Fecha ' + datePipe.transform(this.saleOrder.endDate, 'dd/MM/yyyy') + '  Hora ' + datePipe.transform(this.saleOrder.endDate, 'HH:mm') + '\n' +
        'Mesa: ' + this.saleOrder.table.description + '\n' +
        'Empleado: ' + this.saleOrder.employee.name + '\n\n';

      content += 'DESCRIPCION.			CANTIDAD\n' +
        '----------------------------------------\n';
      for (let barArticleToPrint of this.barArticlesToPrint) {
        content += barArticleToPrint.description + '    ' + barArticleToPrint.amount + '\n';
        content += barArticleToPrint.observation + '\n';
      }

      let fileName: string = 'pedido-' + this.saleOrder.origin + '-' + this.saleOrder.number;

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
              this.changeStateOfTable(TableState.Busy, true);
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
          this.openModal("errorMessage");
          this.loading = false;
        }
      );
    } else {
      this.showMessage("No existen artículos en el pedido", "danger", false); 
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
        'Fecha ' + datePipe.transform(this.saleOrder.endDate, 'dd/MM/yyyy') + '  Hora ' + datePipe.transform(this.saleOrder.endDate, 'HH:mm') + '\n' +
        'Mesa: ' + this.saleOrder.table.description + '\n' +
        'Empleado: ' + this.saleOrder.employee.name + '\n\n';

      content += 'DESCRIPCION.			CANTIDAD\n' +
        '----------------------------------------\n';
      for (let kitchenArticleToPrint of this.kitchenArticlesToPrint) {
        content += kitchenArticleToPrint.description + '    ' + kitchenArticleToPrint.amount + '\n';
        content += kitchenArticleToPrint.observation + '\n';
      }

      let fileName: string = 'pedido-' + this.saleOrder.origin + '-' + this.saleOrder.number;

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
            this.changeStateOfTable(TableState.Busy, true);
          } else {
            this.showMessage("Ha ocurrido un error en el servidor", "danger", false);
          }
          this.loading = false;
        },
        error => {
          this.openModal("errorMessage");
          this.loading = false;
        }
      );
    } else {
      this.showMessage("No existen artículos en el pedido", "danger", false);
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