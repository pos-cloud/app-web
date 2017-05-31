import { Component, OnInit, ElementRef, ViewChild, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/interval';

import { SaleOrder, SaleOrderState } from './../../models/sale-order';
import { Article } from './../../models/article';
import { MovementOfArticle } from './../../models/movement-of-article';
import { CashBox, CashBoxState } from './../../models/cash-box';
import { Table, TableState } from './../../models/table';
import { Waiter } from './../../models/waiter';
import { Category } from './../../models/category';

import { MovementOfArticleService } from './../../services/movement-of-article.service';
import { SaleOrderService } from './../../services/sale-order.service';
import { TableService } from './../../services/table.service';
import { CashBoxService } from './../../services/cash-box.service';

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
  @ViewChild('contentAmount') contentAmount:ElementRef;
  @ViewChild('contentDiscount') contentDiscount:ElementRef;
  private discountAmount: number;
  private discountPorcent: number;

  private formErrorsAmountOfItem = {
    'amount1': ''
  };

  private validationMessagesAmountOfItem = {
    'amount1': {
      'required':       'Este campo es requerido.'
    }
  };

  private formErrorsDiscount = {
    'amount': 0.00,
    'porcent': 0.00
  };

  private validationMessagesDiscount = {
    'amount': {
    },
    'porcent': {
    }
  };

  constructor(
    private _fb: FormBuilder,
    private _saleOrderService: SaleOrderService,
    private _movementOfArticleService: MovementOfArticleService,
    private _cashBoxService: CashBoxService,
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
    this.discountAmount = 0.00;
    this.discountPorcent = 0.00;
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
    this.buildFormAmountOfItem();
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
          this.addSaleOrder();
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

  private buildFormAmountOfItem(): void {

    this.amountOfItemForm = this._fb.group({
      'amount1': [this.movementOfArticle.amount, [
          Validators.required
        ]
      ],
      'notes': [this.movementOfArticle.notes, [
        ]
      ]
    });

    this.amountOfItemForm.valueChanges
      .subscribe(data => this.onValueChangedAmountOfItem(data));

    this.onValueChangedAmountOfItem();
  }

  private buildFormDiscount(): void {

    this.discountForm = this._fb.group({
      'amount': [this.discountAmount, [
          Validators.required
        ]
      ],
      'porcent': [this.discountPorcent, [
        ]
      ]
    });

    this.discountForm.valueChanges
      .subscribe(data => this.onValueChangedAmountOfItem(data));

    this.onValueChangedAmountOfItem();
  }

  private onValueChangedAmountOfItem(data?: any): void {

    if (!this.amountOfItemForm) { return; }
    const form = this.amountOfItemForm;

    for (const field in this.formErrorsAmountOfItem) {
      this.formErrorsAmountOfItem[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessagesAmountOfItem[field];
        for (const key in control.errors) {
          this.formErrorsAmountOfItem[field] += messages[key] + ' ';
        }
      }
    }
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
            this.changeStateOfTable();
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

  private showCategories(): void {

    this.areCategoriesVisible = true;
    this.areArticlesVisible = false;
  }

  private changeStateOfTable(): void {

    this.table.state = TableState.Busy;
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
            this.buildFormAmountOfItem();
            modalRef = this._modalService.open(this.contentAmount).result.then((result) => {
              if(result === 'add_item') {
                this.confirmAmount();
              }
            }, (reason) => {
              
            });
          break;
        case 'discount' : 
          this.buildFormDiscount();
          modalRef = this._modalService.open(this.contentDiscount).result.then((result) => {
              if(result === 'discount') {
                this.confirmAmount();
              }
            }, (reason) => {
              
            });
        break;
        default : ;
    };
  }

  private confirmAmount(){
    this.movementOfArticle.amount = this.amountOfItemForm.value.amount;
    this.movementOfArticle.notes = this.amountOfItemForm.value.notes;
    this.movementOfArticle.totalPrice = this.movementOfArticle.amount * this.movementOfArticle.salePrice;
    this.saveMovementOfArticle();
  }

  private saveMovementOfArticle(): void {
    this._movementOfArticleService.saveMovementOfArticle(this.movementOfArticle).subscribe(
      result => {
        if (!result.movementOfArticle) {
          this.alertMessage = result.message;
        } else {
          this.alertMessage = null;
          this.movementOfArticle = result.movementOfArticle;
          this.updateSaleOrder();
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

  private addItemToOrder(): void {

    this.movementsOfArticles.push(this.movementOfArticle);
    this.areMovementsOfArticlesEmpty = false;
  }

  private addAmount(): void {
    this.amountOfItemForm.setValue({'amount': this.amountOfItemForm.value.amount + 1
    });
  }

  private subtractAmount(): void {

    if (this.amountOfItemForm.value.amount > 1) {
      this.amountOfItemForm.setValue({'amount': this.amountOfItemForm.value.amount - 1});
    } else {
      this.amountOfItemForm.setValue({'amount': 1});
    }
  }

  private updateSaleOrder(): void {
    
    this._saleOrderService.updateSaleOrder(this.saleOrder).subscribe(
      result => {
          if(!result.saleOrder) {
            this.alertMessage = result.message;
          } else {
            this.alertMessage = null;
            this.addItemToOrder();
            this.movementOfArticle = new MovementOfArticle();
            this.buildFormAmountOfItem();
            this.buildFormDiscount();
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


   private updatePrices(): void {

      this.saleOrder.totalPrice = 0;

      for(let movementOfArticle of this.movementsOfArticles) {

        this.saleOrder.totalPrice = parseFloat(""+this.saleOrder.totalPrice) + parseFloat(""+movementOfArticle.totalPrice);
      }
   }

}