import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
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

  private date: Date;
  private waiter: Waiter;
  private saleOrderForm : FormGroup;
  private saleOrders: SaleOrder[] = new Array();
  private alertMessage: any;
  private waiters: Waiter[] = new Array();

  private formErrors = {
    'waiter': '',
    'date': ''
  };

  private validationMessages = {
    'waiter': {
      'required':       'Este campo es requerido.'
    },
    'date' : {
      'required':       'Este campo es requerido'
    }
  };

  constructor(
    private _saleOrderService: SaleOrderService,
    private _waiterService: WaiterService,
    private _router: Router,
    private _fb: FormBuilder
  ) { }

  ngOnInit() {
    this.waiter = new Waiter();
    this.date = new Date();
    this.getWaiters();
    this.buildForm();
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

  private buildForm(): void {

    this.saleOrderForm = this._fb.group({
      'waiter': [this.waiter, [
          Validators.required
        ]
      ],
      'date' : [this.date, [
          Validators.required
        ]
      ]
    });

    this.saleOrderForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  private onValueChanged(data?: any): void {

    if (!this.saleOrderForm) { return; }
    const form = this.saleOrderForm;

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

  private reportByWaiterByDay(): void {

    this.waiter = this.saleOrderForm.value.waiter;

    this._saleOrderService.getSaleOrdersByWaiter(this.waiter._id,"2017-06-02").subscribe(
      result => {
        if(!result.saleOrders) {
          this.alertMessage = result.message;
          this.saleOrders = null;
        } else {
          this.alertMessage = null;
          this.saleOrders = result.saleOrders;
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