import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { SaleOrder } from './../../models/sale-order';
import { SaleOrderService } from './../../services/sale-order.service';

import { AddSaleOrderComponent } from './../../components/add-sale-order/add-sale-order.component';
import { UpdateSaleOrderComponent } from './../../components/update-sale-order/update-sale-order.component';
import { DeleteSaleOrderComponent } from './../../components/delete-sale-order/delete-sale-order.component';

@Component({
  selector: 'app-list-sale-orders',
  templateUrl: './list-sale-orders.component.html',
  styleUrls: ['./list-sale-orders.component.css']
})

export class ListSaleOrdersComponent implements OnInit {

  private saleOrders: SaleOrder[] = new Array();
  private areSaleOrdersEmpty: boolean = true;
  private alertMessage: any;
  private userType: string;
  private orderTerm: string[] = ['number'];
  private propertyTerm: string;
  private areFiltersVisible: boolean = false;

  constructor(
    private _saleOrderService: SaleOrderService,
    private _router: Router,
    private _modalService: NgbModal
  ) { }

  ngOnInit(): void {
    
    this._router.events.subscribe((data:any) => { 
      let pathLocation: string;
      pathLocation = data.url.split('/');
      this.userType = pathLocation[1];
    });
    this.getSaleOrders();
  }

  private getBadge(term: string): boolean {

    return true;
  }

  private getSaleOrders(): void {  

    this._saleOrderService.getSaleOrders().subscribe(
        result => {
					if(!result.saleOrders) {
						this.alertMessage = result.message;
            this.saleOrders = null;
            this.areSaleOrdersEmpty = true;
					} else {
            this.alertMessage = null;
					  this.saleOrders = result.saleOrders;
            this.areSaleOrdersEmpty = false;
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

  private orderBy (term: string, property?: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-"+term;  
    } else {
      this.orderTerm[0] = term; 
    }
    this.propertyTerm = property;
  }
  
  private openModal(op: string, saleOrder:SaleOrder): void {

      let modalRef;
      switch(op) {
        case 'add' :
          modalRef = this._modalService.open(AddSaleOrderComponent, { size: 'lg' }).result.then((result) => {
            this.getSaleOrders();
          }, (reason) => {
            this.getSaleOrders();
          });
          break;
        case 'update' :
            modalRef = this._modalService.open(UpdateSaleOrderComponent, { size: 'lg' })
            modalRef.componentInstance.saleOrder = saleOrder;
            modalRef.result.then((result) => {
              if(result === 'save_close') {
                this.getSaleOrders();
              }
            }, (reason) => {
              
            });
          break;
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

    private addSaleOrder(saleOrderCode: number) {
      this._router.navigate(['/pos/mesas/'+saleOrderCode+'/add-sale-order']);
    }
}