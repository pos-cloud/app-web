import { Component, OnInit, ElementRef, ViewChild, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SaleOrder, SaleOrderStatus } from './../../models/sale-order';
import { Article } from './../../models/article';
import { MovementOfArticle } from './../../models/movement-of-article';
import { CashBox, CashBoxStatus } from './../../models/cash-box';
import { Table, TableStatus } from './../../models/table';
import { Waiter } from './../../models/waiter';

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
  private areMovementsOfArticlesEmpty: boolean = true;
  private userType: string;
  private table: Table;
  private tableId: string;
  private loading: boolean = false;
  @ViewChild('content') content:ElementRef;

  private formErrors = {
    'amount': ''
  };

  private validationMessages = {
    'amount': {
      'required':       'Este campo es requerido.'
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
          this.getOpenCashBox();
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

  private getOpenCashBox(): void {

    this._cashBoxService.getOpenCashBox().subscribe(
        result => {
          if(!result.cashBoxes) {
            this.alertMessage = "No tiene caja abierta";
          } else {
            this.saleOrder.cashBox = result.cashBoxes[0];
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

  private buildForm(): void {

    this.amountOfItemForm = this._fb.group({
      'amount': [this.movementOfArticle.amount, [
          Validators.required
        ]
      ],
      'observation': [this.movementOfArticle.observation, [
          
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

  private addSaleOrder(): void {
    
    this._saleOrderService.saveSaleOrder(this.saleOrder).subscribe(
      result => {
          if(!result.saleOrder) {
            this.alertMessage = result.message;
          } else {
            this.alertMessage = null;
            this.saleOrder = result.saleOrder;
            this.changeStatusOfTable();
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

  private changeStatusOfTable(): void {

    this.table.status = TableStatus.Busy;
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
    this.openModal();
  }

  private openModal(): void {
    let modalRef = this._modalService.open(this.content).result.then((result) => {
      if(result  === "add_item"){
        this.confirmAmount();
      }
    }, (reason) => {
      
    });
  }

  private confirmAmount(){
    this.movementOfArticle.amount = this.amountOfItemForm.value.amount;
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
            this.buildForm();
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