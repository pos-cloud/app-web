import { Component, OnInit, ElementRef, ViewChild, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SaleOrder, SaleOrderStatus } from './../../models/sale-order';
import { Article } from './../../models/article';
import { MovementOfArticle } from './../../models/movement-of-article';
import { Table } from './../../models/table';

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
  private movementsOfArticles: MovementOfArticle[] = [];
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
    private _tableService: TableService,
    private _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    private _modalService: NgbModal
  ) {
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
    this.saleOrder = new SaleOrder();
    this.table = new Table();
    this.movementOfArticle = new MovementOfArticle();
  }

  ngOnInit(): void {

    this._router.events.subscribe((data:any) => {
      let locationPathURL: string = data.url.split('/');
      this.userType = locationPathURL[1];
      if(this.tableId === undefined) {
        this.tableId = locationPathURL[3];
        if(this.tableId !== undefined){
          this.getTable(this.tableId);
        }
      }
    });
    this.buildForm();
  }

  private getTable(id: string): void  {

      console.log("entro GET"+id);
    this._tableService.getTable(id).subscribe(
      result => {
        this.table = result.table;
        if(!this.table) {
          this.alertMessage = "Error al traer mesas. Error en el servidor.";
        } else {
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

  private buildForm(): void {

    this.amountOfItemForm = this._fb.group({
      'amount': [this.movementOfArticle.amount, [
          Validators.required
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
          if(!this.saleOrder) {
            this.alertMessage = "Error en el servidor.";
          } else {
            this.saleOrder = result.saleOrder;
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
        if (!this.movementOfArticle) {
          this.alertMessage = 'Ha ocurrido un error al querer facturar el producto.';
        } else {
          this.movementOfArticle = result.movementOfArticle;
          this.addItemToOrder();
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

  private addItemToOrder(): void {

    this.movementsOfArticles.push(this.movementOfArticle);
    this.saleOrder.totalPrice = parseFloat(""+this.saleOrder.totalPrice) + parseFloat(""+this.movementOfArticle.totalPrice);
    this.areMovementsOfArticlesEmpty = false;
  }

  // private getMovementsOfArticles(): void {

  //   this._movementOfArticleService.getMovementsOfArticles().subscribe(
  //       result => {
	// 				this.movementsOfArticles = result.movementsOfArticles;
	// 				if(!this.movementsOfArticles) {
	// 					this.alertMessage = "Error al traer artículos. Error en el servidor.";
  //           this.areMovementsOfArticlesEmpty = true;
	// 				} else if(this.movementsOfArticles.length !== 0){
  //            this.areMovementsOfArticlesEmpty = false;
  //         } else {
  //           this.areMovementsOfArticlesEmpty = true;
  //         }
	// 			},
	// 			error => {
	// 				this.alertMessage = error;
	// 				if(!this.alertMessage) {
	// 					this.alertMessage = "Error en la petición.";
	// 				}
	// 			}
  //     );
  //  }
}