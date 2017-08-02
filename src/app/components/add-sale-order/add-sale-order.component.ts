import { Component, OnInit, ElementRef, ViewChild, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SaleOrder, SaleOrderState } from './../../models/sale-order';
import { Article } from './../../models/article';
import { MovementOfArticle } from './../../models/movement-of-article';
import { Table, TableState } from './../../models/table';
import { Employee } from './../../models/employee';
import { Category } from './../../models/category';
import { Room } from './../../models/room';
import { Print } from './../../models/print';

import { MovementOfArticleService } from './../../services/movement-of-article.service';
import { SaleOrderService } from './../../services/sale-order.service';
import { TableService } from './../../services/table.service';
import { TurnService } from './../../services/turn.service';
import { PrintService } from './../../services/print.service';

import { ListCompaniesComponent } from './../list-companies/list-companies.component';

import { DatePipe, DecimalPipe } from '@angular/common'; 

@Component({
  selector: 'app-add-sale-order',
  templateUrl: './add-sale-order.component.html',
  styleUrls: ['./add-sale-order.component.css'],
  providers: [NgbAlertConfig, DatePipe, DecimalPipe]
})

export class AddSaleOrderComponent implements OnInit {

  public saleOrder: SaleOrder;
  public alertMessage: any;
  public movementOfArticle: MovementOfArticle;
  public movementsOfArticles: MovementOfArticle[] = new Array();
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
  @ViewChild('contentPayment') contentPayment:ElementRef;
  public discountPorcent: number = 0.00;
  public discountAmount: number = 0.00;
  public isNewItem: boolean;
  public paymentAmount: number = 0.00;
  public paymentChange: string = '0.00';

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
    public _modalService: NgbModal
  ) {
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
    this.saleOrder = new SaleOrder();
    this.saleOrder.employee = new Employee();
    this.saleOrder.table = new Table();
    this.table = new Table();
    this.movementOfArticle = new MovementOfArticle();
    this.categorySelected = new Category();
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    if(this.tableId === undefined) {
      this.tableId = pathLocation[5];
    }

    this.getLastSaleOrderByTable();
    this.buildForm();
    this.buildFormDiscount();
    this.buildFormPayment();
  }

  public getLastSaleOrderByTable(): void {

    this._saleOrderService.getLastSaleOrderByTable(this.tableId).subscribe(
      result => {

        let saleOrderState: SaleOrderState;
        
        if(result.saleOrders){
          if(result.saleOrders[0] !== undefined) {
            saleOrderState = result.saleOrders[0].state;
          } else {
            saleOrderState = SaleOrderState.Closed;
          }
        } else if(result.message = "No se encontraron pedidos") {
          saleOrderState = SaleOrderState.Closed;
        } else {
          saleOrderState = SaleOrderState.Closed;
        }
        
        if(saleOrderState !== SaleOrderState.Open) {
          this.alertMessage = null;
          this.getTable(this.tableId);
        } else {
          this.alertMessage = null;
          this.saleOrder = result.saleOrders[0];
          this.discountAmount = this.saleOrder.discount;
          this.table = this.saleOrder.table;
          saleOrderState = SaleOrderState.Open;
          this.getMovementsOfSaleOrder();
        }
      },
      error => {
        this.alertMessage = error._body;
        if(!this.alertMessage) {
          this.alertMessage = "Ha ocurrido un error en el servidor";
          this.alertConfig.type = "danger";
        }
      }
    );
  }

  public getLastSaleOrderByOrigen(): void {
    
    let origin = 0;

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
          this.alertMessage = "Ha ocurrido un error en obtener el último pedido";
          this.alertConfig.type = "danger";
        }
      },
      error => {
        this.alertMessage = error._body;
        if(!this.alertMessage) {
          this.alertMessage = "Ha ocurrido un error en el servidor";
          this.alertConfig.type = "danger";
        }
      }
    );
  }

  public getTable(id: string): void  {
    
    this._tableService.getTable(id).subscribe(
      result => {
        if(!result.table) {
          this.alertMessage = result.message;
          this.alertConfig.type = 'danger';
        } else {
          this.alertMessage = null;
          this.table = result.table;
          this.saleOrder.table = this.table;
          this.saleOrder.employee = this.table.employee;
          this.getOpenTurn();
        }
      },
      error => {
        this.alertMessage = error._body;
        if(!this.alertMessage) {
          this.alertMessage = "Ha ocurrido un error en el servidor";
        }
      }
    );
  }

  public getOpenTurn(): void {
    
      this._turnService.getOpenTurn(this.saleOrder.employee._id).subscribe(
        result => {
					if(!result.turns) {
            this.alertMessage = result.message;
            this.alertConfig.type = 'danger';
					} else {
            this.loading = false;
            this.saleOrder.turn = result.turns[0];
            this.getLastSaleOrderByOrigen();
          }
				},
				error => {
					this.alertMessage = error._body;
					if(!this.alertMessage) {
						this.alertMessage = "Ha ocurrido un error en el servidor";
					}
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
    
    this._saleOrderService.saveSaleOrder(this.saleOrder).subscribe(
      result => {
          if(!result.saleOrder) {
            this.alertMessage = result.message;
            this.alertConfig.type = 'danger';
          } else {
            this.alertMessage = null;
            this.saleOrder = result.saleOrder;
          }
        },
        error => {
          this.alertMessage = error._body;
          if(!this.alertMessage) {
              this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
          }
          this.loading = false;
        }
    );
  }

  public updateSaleOrder(): void {
    
    this._saleOrderService.updateSaleOrder(this.saleOrder).subscribe(
      result => {
          if(!result.saleOrder) {
            this.alertMessage = result.message;
            this.alertConfig.type = 'danger';
          } else {
            //No anulamos el mensaje para que figuren en el pos.
          }
        },
        error => {
          this.alertMessage = error._body;
          if(!this.alertMessage) {
              this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
          }
          this.loading = false;
        }
    );
  }

  public showArticlesOfCategory(category: Category): void {
    
    this.categorySelected = category;
    this.areArticlesVisible = true;
    this.areCategoriesVisible = false;
  }

  public changeStateOfTable(state: any): void {

    this.table.state = state;
    this._tableService.updateTable(this.table).subscribe(
      result => {
        if (!result.table) {
          this.alertMessage = result.message;
          this.alertConfig.type = 'danger';
        } else {
          this.table = result.table;
          this.backToRooms();
        }
        this.loading = false;
      },
      error => {
        this.alertMessage = error._body;
        if(!this.alertMessage) {
            this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        }
        this.loading = false;
      }
    );
  }
  
  public addItem(itemData?: MovementOfArticle): void {

    if(itemData) {
      this.isNewItem = false;
      this.movementOfArticle = itemData;
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
            this.alertMessage = "No existen artículos en el pedido.";
            this.alertConfig.type = "danger";
          }
          break;
        case 'cancel_order' :
        
          modalRef = this._modalService.open(this.contentCancelOrder, { size: 'lg' }).result.then((result) => {
            if(result  === "cancel_order"){
              this.saleOrder.state = SaleOrderState.Canceled;
              this.updateSaleOrder();
              this.table.employee = null;
              this.changeStateOfTable(TableState.Available);
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
              if(result  === "charge"){
                this.saleOrder.state = SaleOrderState.Closed;
                this.saleOrder.cashChange = this.paymentForm.value.cashChange;
                this.updateSaleOrder();
                this.table.employee = null;
                this.toPrintCharge();
              }
            }, (reason) => {
              
            });
          } else {
            this.alertMessage = "No existen artículos en el pedido.";
            this.alertConfig.type = "danger";
          }
          break;
        default : ;
    };
  }

  public backToRooms(): void {
    this._router.navigate(['/pos/salones/'+this.saleOrder.table.room+'/mesas']);
  }

  public confirmAmount(): void {
    
    this.movementOfArticle.description = this.amountOfItemForm.value.description;
    this.movementOfArticle.amount = this.amountOfItemForm.value.amount;
    this.movementOfArticle.salePrice = this.amountOfItemForm.value.salePrice;
    this.movementOfArticle.notes = this.amountOfItemForm.value.notes;
    this.movementOfArticle.totalPrice = this.movementOfArticle.amount * this.movementOfArticle.salePrice;
    this.saveMovementOfArticle();
  }

  public applyDiscount(): void {
    
    if( this.discountPorcent > 0 && 
        this.discountPorcent <= 100 && 
        this.discountPorcent !== null && 
        (this.discountAmount === 0 || this.discountAmount === null)){

      this.saleOrder.discount = parseFloat(""+this.saleOrder.subtotalPrice) * parseFloat(""+this.discountForm.value.porcent) / 100;
      this.alertMessage = null;
    } else if(( this.discountPorcent === 0 || 
                this.discountPorcent === null) && 
                this.discountAmount > 0  && 
                this.discountAmount <= this.saleOrder.subtotalPrice  &&
                this.discountAmount !== null){

      this.saleOrder.discount = this.discountAmount;
      this.alertMessage = null;
    } else if(this.discountAmount !== 0 && this.discountPorcent !== 0){
      
      this.saleOrder.discount = 0;
      this.alertMessage = "Solo debe cargar un solo descuento.";
      this.alertConfig.type = "danger";
    } else {
      this.alertMessage = null;
    }

    if(this.saleOrder.discount != 0) {
      this.saleOrder.totalPrice = parseFloat(""+this.saleOrder.subtotalPrice) - parseFloat(""+this.saleOrder.discount);
    } else {
      this.saleOrder.totalPrice = this.saleOrder.subtotalPrice;
    }
    
    this.updateSaleOrder();
  }

  public saveMovementOfArticle(): void {

    this._movementOfArticleService.saveMovementOfArticle(this.movementOfArticle).subscribe(
      result => {
        if (!result.movementOfArticle) {
          this.alertMessage = result.message;
          this.alertConfig.type = 'danger';
        } else {
          this.alertMessage = null;
          this.movementOfArticle = result.movementOfArticle;
          this.getMovementsOfSaleOrder();
          this.movementOfArticle = new MovementOfArticle();
          this.buildForm();
        }
        this.loading = false;
      },
      error => {
        this.alertMessage = error._body;
        if(!this.alertMessage) {
            this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        }
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
				},
				error => {
					this.alertMessage = error._body;
					if(!this.alertMessage) {
						this.alertMessage = "Ha ocurrido un error en el servidor";
					}
				}
      );
  }

  public showCategories(): void {

    this.areCategoriesVisible = true;
    this.areArticlesVisible = false;
  }

  public deleteMovementOfArticle(movementOfArticleId: string): void {
    
    this._movementOfArticleService.deleteMovementOfArticle(movementOfArticleId).subscribe(
      result => {
        this.getMovementsOfSaleOrder();
      },
      error => {
        this.alertMessage = error._body;
        if(!this.alertMessage) {
            this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        }
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

   public toPrintBill(): void {
     
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
          'Fecha ' + datePipe.transform(this.saleOrder.date, 'dd/MM/yyyy')  + '  Hora '  + datePipe.transform(this.saleOrder.date, 'HH:mm')  + '\n' +
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

        let fileName: string = 'tiquet-' + this.saleOrder.origin + '-' + this.saleOrder.number;
        
        let print: Print = new Print();
        print.fileName = fileName;
        print.content = content;
        this.changeStateOfTable(TableState.Pending);
        // this._printService.toPrint(print).subscribe(
        //   result => {
        //     if(result.message === 'ok'){
        //       this.changeStateOfTable(TableState.Pending);
        //       this.backToRooms();
        //     } else {
        //       this.alertMessage = "Ha ocurrido un error en el servidor. Comuníquese con el Administrador de sistemas.";
        //       this.alertConfig.type = "danger";
        //     }
        //   },
        //   error => {
        //     this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        //     this.alertConfig.type = 'danger';
        //   }
        // );
      } else {
        this.alertMessage = "No existen artículos en el pedido.";
        this.alertConfig.type = "danger";
      }
   }

   public toPrintCharge(): void {

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
          'Fecha ' + datePipe.transform(this.saleOrder.date, 'dd/MM/yyyy')  + '  Hora '  + datePipe.transform(this.saleOrder.date, 'HH:mm')  + '\n' +
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
          'Su pago:					 '+ decimalPipe.transform(parseFloat(""+this.saleOrder.totalPrice) * parseFloat(""+this.saleOrder.cashChange), '1.2-2') + '\n' +
          'Su vuelto:					 '+ decimalPipe.transform(this.saleOrder.cashChange, '1.2-2') + '\n\n' +
          'Ticket no válido como factura. Solicite su factura en el mostrador.\n\n' +
          '----Gracias por su visita.----\n\n\n';

        let fileName: string = 'tiquet-' + this.saleOrder.origin + '-' + this.saleOrder.number;
        
        let print: Print = new Print();
        print.fileName = fileName;
        print.content = content;
        this.changeStateOfTable(TableState.Available);
        // this._printService.toPrint(print).subscribe(
        //   result => {
        //     if(result.message === 'ok'){
        //       this.changeStateOfTable(TableState.Available);
        //       this.backToRooms();
        //     } else {
        //       this.alertMessage = "Ha ocurrido un error en el servidor. Comuníquese con el Administrador de sistemas.";
        //       this.alertConfig.type = "danger";
        //     }
        //   },
        //   error => {
        //     this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        //     this.alertConfig.type = 'danger';
        //   }
        // );
      } else {
        this.alertMessage = "No existen artículos en el pedido.";
        this.alertConfig.type = "danger";
      }
   }
}