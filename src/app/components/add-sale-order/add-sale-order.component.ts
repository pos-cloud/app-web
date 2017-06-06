import { Component, OnInit, ElementRef, ViewChild, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SaleOrder, SaleOrderState } from './../../models/sale-order';
import { Article } from './../../models/article';
import { MovementOfArticle } from './../../models/movement-of-article';
import { Table, TableState } from './../../models/table';
import { Waiter } from './../../models/waiter';
import { Category } from './../../models/category';
import { Company } from './../../models/company';

import { ListCompaniesComponent } from './../list-companies/list-companies.component';

import { MovementOfArticleService } from './../../services/movement-of-article.service';
import { SaleOrderService } from './../../services/sale-order.service';
import { TableService } from './../../services/table.service';

@Component({
  selector: 'app-add-sale-order',
  templateUrl: './add-sale-order.component.html',
  styleUrls: ['./add-sale-order.component.css'],
  providers: [NgbAlertConfig]
})

export class AddSaleOrderComponent implements OnInit {

  private saleOrder: SaleOrder;
  private alertMessage: any;
  private movementOfArticle: MovementOfArticle;
  private movementsOfArticles: MovementOfArticle[] = new Array();
  private amountOfItemForm: FormGroup;
  private discountForm: FormGroup;
  private areMovementsOfArticlesEmpty: boolean = true;
  private userType: string;
  private table: Table;
  private tableId: string;
  private loading: boolean = false;
  private areCategoriesVisible: boolean = true;
  private areArticlesVisible: boolean = false;
  private categorySelected: Category;
  @ViewChild('content') content:ElementRef;
  @ViewChild('contentDiscount') contentDiscount:ElementRef;
  @ViewChild('contentCancelOrder') contentCancelOrder:ElementRef;
  private discountPorcent: number = 0.00;
  private discountAmount: number = 0.00;

  private formErrors = {
    'amount': ''
  };

  private validationMessages = {
    'amount': {
      'required':       'Este campo es requerido.'
    }
  };

  private formErrorsDiscount = {
    'amount': '',
    'porcent': ''
  };

  private validationMessagesDiscount = {
    'amount': {
      'required':       'Este campo es requerido.'
    },
    'porcent': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    private _fb: FormBuilder,
    private _saleOrderService: SaleOrderService,
    private _movementOfArticleService: MovementOfArticleService,
    private _tableService: TableService,
    private _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    private _modalService: NgbModal
  ) {
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
    this.saleOrder = new SaleOrder();
    this.saleOrder.waiter = new Waiter();
    this.saleOrder.table = new Table();
    this.table = new Table();
    this.movementOfArticle = new MovementOfArticle();
    this.categorySelected = new Category();
  }

  ngOnInit(): void {

    this._router.events.subscribe((data:any) => {
      let locationPathURL: string = data.url.split('/');
      this.userType = locationPathURL[1];
      if(this.tableId === undefined) {
        this.tableId = locationPathURL[5];
        if(this.tableId !== undefined){
          this.getTable(this.tableId);
        }
      }
    });
    this.buildForm();
    this.buildFormDiscount();
  }

  private getTable(id: string): void  {
    
    this._tableService.getTable(id).subscribe(
      result => {
        if(!result.table) {
          this.alertMessage = result.message;
        } else {
          this.alertMessage = null;
          this.table = result.table;
          this.saleOrder.table = this.table;
          this.saleOrder.waiter = this.table.waiter;
          this.getLastSaleOrder();
        }
      },
      error => {
        this.alertMessage = error;
        if(!this.alertMessage) {
          this.alertMessage = "Error en la petición.";
        }
      }
    );
  }

  private buildForm(): void {

    this.amountOfItemForm = this._fb.group({
      'amount': [this.movementOfArticle.amount, [
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

  private onValueChanged(data?: any): void {

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

  private buildFormDiscount(): void {

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

  private onValueChangedDiscount(data?: any): void {

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

  private addSaleOrder(): void {
    
    this._saleOrderService.saveSaleOrder(this.saleOrder).subscribe(
      result => {
          if(!result.saleOrder) {
            this.alertMessage = result.message;
          } else {
            this.alertMessage = null;
            this.saleOrder = result.saleOrder;
            this.changeStateOfTable(TableState.Busy);
          }
        },
        error => {
          this.alertMessage = error;
          if(!this.alertMessage) {
              this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
          }
          this.loading = false;
        }
    );
  }

  private updateSaleOrder(): void {
    
    this._saleOrderService.updateSaleOrder(this.saleOrder).subscribe(
      result => {
          if(!result.saleOrder) {
            this.alertMessage = result.message;
          } else {
            this.alertMessage = null;
          }
        },
        error => {
          this.alertMessage = error;
          if(!this.alertMessage) {
              this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
          }
          this.loading = false;
        }
    );
  }

  private showArticlesOfCategory(category: Category): void {
    
    this.categorySelected = category;
    this.areArticlesVisible = true;
    this.areCategoriesVisible = false;
  }

  private changeStateOfTable(state: any): void {

    this.table.state = state;
    this._tableService.updateTable(this.table).subscribe(
      result => {
        if (!result.table) {
          this.alertMessage = result.message;
        } else {
          this.table = result.table;
        }
        this.loading = false;
      },
      error => {
        this.alertMessage = error;
        if(!this.alertMessage) {
            this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        }
        this.loading = false;
      }
    );
  }
  
  private addItem(itemData): void {

    this.movementOfArticle = itemData;
    this.movementOfArticle.saleOrder = this.saleOrder;
    this.openModal('add_item');
  }

  private openModal(op: string): void {

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
        case 'apply_discount' :
        
          modalRef = this._modalService.open(this.contentDiscount, { size: 'lg' }).result.then((result) => {
            if(result  === "apply_discount"){
              this.discountPorcent = this.discountForm.value.porcent;
              this.discountAmount = this.discountForm.value.amount;
              this.updatePrices();
            }
          }, (reason) => {
            
          });
          break;
        case 'cancel_order' :
        
          modalRef = this._modalService.open(this.contentCancelOrder, { size: 'lg' }).result.then((result) => {
            if(result  === "cancel_order"){
              this.saleOrder.state = SaleOrderState.Canceled;
              this.updateSaleOrder();
              this.table.waiter = null;
              this.changeStateOfTable(TableState.Available);
              this.backToRooms();
            }
          }, (reason) => {
            
          });
          break;
        case 'add_client' :
        
          modalRef = this._modalService.open(ListCompaniesComponent, { size: 'lg' });
          modalRef.componentInstance.userType = this.userType;
          modalRef.result.then((result) => {
            console.log(result);
            if(result  === "add_client"){
            }
          }, (reason) => {
            
          });
          break;
        default : ;
    };
  }

  private getLastSaleOrder(): void {
    
    this._saleOrderService.getLastSaleOrderByOrigen(this.saleOrder.origin).subscribe(
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
        this.alertMessage = error;
        if(!this.alertMessage) {
          this.alertMessage = "Error en la petición.";
          this.alertConfig.type = "danger";
        }
      }
    );
  }

  private backToRooms(): void {
    this._router.navigate(['/pos/salones/'+this.table.room+'/mesas']);
  }

  private confirmAmount(): void {
    this.movementOfArticle.amount = this.amountOfItemForm.value.amount;
    this.movementOfArticle.notes = this.amountOfItemForm.value.notes;
    this.movementOfArticle.totalPrice = this.movementOfArticle.amount * this.movementOfArticle.salePrice;
    this.saveMovementOfArticle();
  }

  private applyDiscount(): void {

    if( this.discountPorcent > 0 && 
        this.discountPorcent <= 100 && 
        this.discountPorcent !== null && 
        (this.discountAmount === 0 || this.discountAmount === null)){

      this.saleOrder.discount = parseFloat(""+this.saleOrder.totalPrice) * parseFloat(""+this.discountForm.value.porcent) / 100;

    } else if(( this.discountPorcent === 0 || 
                this.discountPorcent === null) && 
                this.discountAmount > 0  && 
                this.discountAmount <= this.saleOrder.totalPrice  &&
                this.discountAmount !== null){

      this.saleOrder.discount = this.discountAmount;
    } else {
      
      this.saleOrder.discount = 0;
      this.alertMessage = "Solo debe cargar un solo dato";
      this.alertConfig.type = "danger";
    }
    
    this.saleOrder.totalPrice = parseFloat(""+this.saleOrder.totalPrice) - parseFloat(""+this.saleOrder.discount);
    
    this.updateSaleOrder();
  }

  private saveMovementOfArticle(): void {

    this._movementOfArticleService.saveMovementOfArticle(this.movementOfArticle).subscribe(
      result => {
        if (!result.movementOfArticle) {
          this.alertMessage = result.message;
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
        this.alertMessage = error;
        if(!this.alertMessage) {
            this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        }
        this.loading = false;
      }
    );
  }

  private addAmount(): void {
    this.amountOfItemForm.setValue({
            'amount': this.amountOfItemForm.value.amount + 1,
            'notes': this.amountOfItemForm.value.notes
    });
  }

  private subtractAmount(): void {

    if (this.amountOfItemForm.value.amount > 1) {
      this.amountOfItemForm.setValue({
              'amount': this.amountOfItemForm.value.amount - 1,
              'notes': this.amountOfItemForm.value.notes
      });
    } else {
      this.amountOfItemForm.setValue({
              'amount': 1,
              'notes': this.amountOfItemForm.value.notes
      });
    }
    
  }

  private getMovementsOfSaleOrder(): void {
    
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
					this.alertMessage = error;
					if(!this.alertMessage) {
						this.alertMessage = "Error en la petición.";
					}
				}
      );
   }

  private showCategories(): void {

    this.areCategoriesVisible = true;
    this.areArticlesVisible = false;
  }

  private deleteMovementOfArticle(movementOfArticleId: string): void {
    
    this._movementOfArticleService.deleteMovementOfArticle(movementOfArticleId).subscribe(
      result => {
        this.getMovementsOfSaleOrder();
      },
      error => {
        this.alertMessage = error;
        if(!this.alertMessage) {
            this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        }
      }
    );
  }

   private updatePrices(): void {

      this.saleOrder.totalPrice = 0;

      for(let movementOfArticle of this.movementsOfArticles) {
        this.saleOrder.totalPrice = parseFloat(""+this.saleOrder.totalPrice) + parseFloat(""+movementOfArticle.totalPrice);
      }
      this.applyDiscount();
   }

}