import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { SaleOrder, SaleOrderState } from './../../models/sale-order';
import { SaleOrderService } from './../../services/sale-order.service';

import { AddSaleOrderComponent } from './../../components/add-sale-order/add-sale-order.component';
import { DeleteSaleOrderComponent } from './../../components/delete-sale-order/delete-sale-order.component';

@Component({
  selector: 'app-list-sale-orders',
  templateUrl: './list-sale-orders.component.html',
  styleUrls: ['./list-sale-orders.component.css'],
  providers: [NgbAlertConfig]
})

export class ListSaleOrdersComponent implements OnInit {

  public saleOrders: SaleOrder[] = new Array();
  public areSaleOrdersEmpty: boolean = true;
  public alertMessage: any;
  public userType: string;
  public orderTerm: string[] = ['number'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;

  constructor(
    public _saleOrderService: SaleOrderService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit(): void {
    
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getSaleOrders();
  }

  public getBadge(term: string): boolean {

    return true;
  }

  public getSaleOrders(): void {  

    this._saleOrderService.getSaleOrders().subscribe(
        result => {
					if(!result.saleOrders) {
						this.alertMessage = result.message;
            this.alertConfig.type = 'danger';
            this.saleOrders = null;
            this.areSaleOrdersEmpty = true;
					} else {
            this.alertMessage = null;
					  this.saleOrders = result.saleOrders;
            this.areSaleOrdersEmpty = false;
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

  public orderBy (term: string, property?: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-"+term;  
    } else {
      this.orderTerm[0] = term; 
    }
    this.propertyTerm = property;
  }
  
  public openModal(op: string, saleOrder:SaleOrder): void {

      let modalRef;
      switch(op) {
        case 'delete' :
            modalRef = this._modalService.open(DeleteSaleOrderComponent, { size: 'lg' })
            modalRef.componentInstance.saleOrder = saleOrder;
            modalRef.result.then((result) => {
              if(result === 'delete_close') {
                this.getSaleOrders();
              }
            }, (reason) => {
              
            });
          break;
        default : ;
      }
    };

    public addSaleOrder(saleOrderCode: number) {
      this._router.navigate(['/pos/mesas/'+saleOrderCode+'/add-sale-order']);
    }

    
}