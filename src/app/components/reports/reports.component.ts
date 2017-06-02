import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Waiter } from './../../models/waiter';
import { SaleOrder } from './../../models/sale-order';

import { SaleOrderService } from './../../services/sale-order.service';
import { WaiterService } from './../../services/waiter.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {


  private saleOrders: SaleOrder[] = new Array();
  private alertMessage: any;
  private waiters: Waiter[] = new Array();
  @Input() waiterSelected: Waiter;

  constructor(
    private _saleOrderService: SaleOrderService,
    private _waiterService: WaiterService,
    private _router: Router,
  ) { }

  ngOnInit() {
  }

  private reportByWaiterByDay(): void {

    this._saleOrderService.getSaleOrdersByWaiter("592748f8711a6015901d8176","25-05-17").subscribe(
      result => {
        if(!result.saleOrders) {
          this.alertMessage = result.message;
          this.saleOrders = null;
        } else {
          this.alertMessage = null;
          this.saleOrders = result.waiters;
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

  private getWaiters(): void {  

    this._waiterService.getWaiters().subscribe(
        result => {
					if(!result.waiters) {
						this.alertMessage = result.message;
					  this.waiters = null;
					} else {
            this.alertMessage = null;
					  this.waiters = result.waiters;
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
}