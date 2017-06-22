import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { Employee } from './../../models/employee';
import { SaleOrder } from './../../models/sale-order';

import { SaleOrderService } from './../../services/sale-order.service';
import { EmployeeService } from './../../services/employee.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
  providers: [NgbAlertConfig]
})
export class ReportsComponent implements OnInit {

  public date: Date;
  public employee: Employee;
  public saleOrderForm : FormGroup;
  public saleOrders: SaleOrder[] = new Array();
  public alertMessage: any;
  public employees: Employee[] = new Array();
  public areSaleOrdersEmpty: boolean = true;
  public areFiltersVisible: boolean = false;

  public formErrors = {
    'employee': '',
    'date': ''
  };

  public validationMessages = {
    'employee': {
      'required':       'Este campo es requerido.'
    },
    'date' : {
      'required':       'Este campo es requerido'
    }
  };

  constructor(
    public _saleOrderService: SaleOrderService,
    public _employeeService: EmployeeService,
    public _router: Router,
    public _fb: FormBuilder,
    public alertConfig: NgbAlertConfig
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit() {
    this.employee = new Employee();
    this.date = new Date();
    this.getEmployees();
    this.buildForm();
  }

  public getEmployees(): void {  

    this._employeeService.getEmployees().subscribe(
        result => {
					if(!result.employees) {
						this.alertMessage = result.message;
            this.alertConfig.type = 'danger';
					  this.employees = null;
					} else {
            this.alertMessage = null;
					  this.employees = result.employees;
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

  public buildForm(): void {

    this.saleOrderForm = this._fb.group({
      'employee': [this.employee, [
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

  public onValueChanged(data?: any): void {

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

  public reportByEmployeeByDay(): void {

    this.employee = this.saleOrderForm.value.employee;

    this._saleOrderService.getSaleOrdersByEmployee(this.employee._id,"2017-06-02").subscribe(
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
        this.alertMessage = error;
        if(!this.alertMessage) {
          this.alertMessage = "Error en la petición.";
        }
      }
    );
  }
}